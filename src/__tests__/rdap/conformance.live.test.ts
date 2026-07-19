import { describe, it, expect, beforeAll } from "vitest";
import { loadBootstrap } from "@/rdap/services/registry";
import { getRegistryURL } from "@/rdap/services/resolver";
import { getAndParse } from "@/rdap/services/api";
import {
	AutonomousNumberSchema,
	DomainSchema,
	IpNetworkSchema,
	type RootRegistryType,
} from "@/rdap/schemas";
import { registryURLs } from "@/rdap/constants";
import { allKeys } from "@/test/fixtures";
import type { ZodSchema } from "zod";

/**
 * The live tier asks real registries whether the URLs we build are acceptable.
 *
 * Offline tests can only confirm a URL matches what we intended to produce. They
 * cannot notice that ARIN rejects "autnum/AS13335" with a 400 while every other RIR
 * accepts it, which is exactly how that bug reached production.
 */

const TYPES: RootRegistryType[] = ["autnum", "domain", "ip4", "ip6", "entity"];

beforeAll(async () => {
	await Promise.all(TYPES.map((type) => loadBootstrap(type)));
}, 60_000);

interface LiveCase {
	type: RootRegistryType;
	target: string;
	registry: string;
	schema: ZodSchema<unknown>;
}

// Known-registered objects spanning all five RIRs and several TLD operators.
const CASES: LiveCase[] = [
	{ type: "autnum", target: "AS13335", registry: "ARIN", schema: AutonomousNumberSchema },
	{
		type: "autnum",
		target: "AS2043",
		registry: "RIPE (single-value)",
		schema: AutonomousNumberSchema,
	},
	{ type: "autnum", target: "AS3333", registry: "RIPE", schema: AutonomousNumberSchema },
	{ type: "autnum", target: "AS4608", registry: "APNIC", schema: AutonomousNumberSchema },
	{ type: "autnum", target: "AS28000", registry: "LACNIC", schema: AutonomousNumberSchema },
	{ type: "autnum", target: "AS37100", registry: "AFRINIC", schema: AutonomousNumberSchema },
	{ type: "ip4", target: "1.1.1.1", registry: "APNIC", schema: IpNetworkSchema },
	{ type: "ip4", target: "8.8.8.8", registry: "ARIN", schema: IpNetworkSchema },
	{ type: "ip4", target: "193.0.6.139", registry: "RIPE", schema: IpNetworkSchema },
	{ type: "ip6", target: "2606:4700::1", registry: "ARIN", schema: IpNetworkSchema },
	{ type: "ip6", target: "2001:200::1", registry: "APNIC", schema: IpNetworkSchema },
	{ type: "domain", target: "example.com", registry: "Verisign", schema: DomainSchema },
	{ type: "domain", target: "example.net", registry: "Verisign", schema: DomainSchema },
	{ type: "domain", target: "example.org", registry: "PIR", schema: DomainSchema },
	{ type: "domain", target: "google.dev", registry: "Google Registry", schema: DomainSchema },
];

describe("live RDAP conformance", () => {
	it.each(CASES)(
		"$registry should accept and serve $type $target",
		async ({ type, target, schema }) => {
			const url = await getRegistryURL(type, target);
			const result = await getAndParse(url, schema, true);

			if (result.isErr) {
				throw new Error(`${url} failed: ${result.error.message}`);
			}

			expect(result.isOk).toBe(true);
		}
	);

	it("should never send an AS-prefixed autnum path to any registry", async () => {
		for (const { target } of CASES.filter((c) => c.type === "autnum")) {
			const url = await getRegistryURL("autnum", target);
			expect(url).toMatch(/\/autnum\/\d+$/);
		}
	});
});

describe("fixture drift against live IANA", () => {
	// A scheduled failure here means IANA changed something the snapshots still
	// describe the old way. Resolve it with `pnpm fixtures:refresh`.
	it.each(TYPES)("%s snapshot should still agree with IANA", async (type) => {
		const response = await fetch(registryURLs[type]);
		expect(response.status).toBe(200);

		const live = (await response.json()) as {
			services: (string[][] | [string[], string[], string[]])[];
		};

		const liveMap = new Map<string, string>();
		for (const entry of live.services) {
			const keys = entry.length === 3 ? entry[1]! : entry[0]!;
			const urls = entry.length === 3 ? entry[2]! : entry[1]!;
			const url = urls.find((u) => u.startsWith("https://")) ?? urls[0]!;
			for (const key of keys) liveMap.set(key, url);
		}

		const snapshot = allKeys(type);
		const moved: string[] = [];
		const removed: string[] = [];

		for (const { key, url } of snapshot) {
			const liveUrl = liveMap.get(key);
			if (liveUrl === undefined) {
				removed.push(key);
			} else if (liveUrl !== url) {
				moved.push(`${key}: ${url} -> ${liveUrl}`);
			}
		}

		const added = [...liveMap.keys()].filter(
			(key) => !snapshot.some((entry) => entry.key === key)
		);
		if (added.length > 0) {
			console.log(`${type}: IANA added ${added.length} key(s) not in the snapshot`);
		}

		// Moved or removed keys mean the app would query a registry that no longer
		// serves that object; added keys only mean the snapshot is behind.
		expect({ moved, removed }).toEqual({ moved: [], removed: [] });
	});
});
