import { RegisterSchema } from "@/rdap/schemas";
import type { Register, RootRegistryType } from "@/rdap/schemas";
import { getBestURL } from "@/rdap/utils";

import asnJson from "@/test/fixtures/asn.json";
import dnsJson from "@/test/fixtures/dns.json";
import ipv4Json from "@/test/fixtures/ipv4.json";
import ipv6Json from "@/test/fixtures/ipv6.json";
import objectTagsJson from "@/test/fixtures/object-tags.json";

/**
 * Snapshots of the real IANA bootstrap files, refreshed by `pnpm fixtures:refresh`.
 *
 * Parsing through RegisterSchema means a snapshot that drifts out of the shape the
 * application expects fails at import rather than as a confusing assertion later.
 */
function parse(name: string, raw: unknown): Register {
	const result = RegisterSchema.safeParse(raw);
	if (!result.success) {
		throw new Error(`Fixture ${name}.json does not satisfy RegisterSchema: ${result.error}`);
	}
	return result.data;
}

export const fixtures: Record<RootRegistryType, Register> = {
	autnum: parse("asn", asnJson),
	domain: parse("dns", dnsJson),
	ip4: parse("ipv4", ipv4Json),
	ip6: parse("ipv6", ipv6Json),
	entity: parse("object-tags", objectTagsJson),
};

/** The keys a bootstrap entry is matched on. Entity entries carry them at index 1. */
export function entryKeys(entry: Register["services"][number]): string[] {
	return entry.length === 3 ? (entry[1] ?? []) : (entry[0] ?? []);
}

/** The candidate URLs for a bootstrap entry. Entity entries carry them at index 2. */
export function entryURLs(entry: Register["services"][number]): string[] {
	return entry.length === 3 ? (entry[2] ?? []) : (entry[1] ?? []);
}

/** The URL the resolver is expected to pick for a bootstrap entry. */
export function expectedURL(entry: Register["services"][number]): string {
	return getBestURL(entryURLs(entry) as [string, ...string[]]);
}

export interface RangeCase {
	/** The key as IANA writes it, e.g. "13312-15359", "2043", or "1.0.0.0/8". */
	key: string;
	/** The RDAP base URL this key must resolve to. */
	url: string;
}

/** Every (key, expected URL) pair in a bootstrap file, flattened. */
export function allKeys(type: RootRegistryType): RangeCase[] {
	return fixtures[type].services.flatMap((entry) => {
		const url = expectedURL(entry);
		return entryKeys(entry).map((key) => ({ key, url }));
	});
}

/** Parse an ASN range key into its inclusive bounds. Single values have equal bounds. */
export function asnBounds(key: string): { start: number; end: number } {
	const [start, end] = key.split("-");
	return {
		start: parseInt(start ?? "", 10),
		end: parseInt(end ?? start ?? "", 10),
	};
}
