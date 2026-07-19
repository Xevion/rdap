import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRegistryURL } from "@/rdap/services/resolver";
import { getCachedRegistry, getRegistry } from "@/rdap/services/registry";
import type { RootRegistryType } from "@/rdap/schemas";
import { fixtures, allKeys, asnBounds, entryKeys, expectedURL } from "@/test/fixtures";

vi.mock("@/rdap/services/registry", () => ({
	getRegistry: vi.fn(),
	getCachedRegistry: vi.fn(),
}));

/**
 * These tests resolve against snapshots of the real IANA bootstrap files rather than
 * hand-written ranges. Idealized fixtures are what let AS2043 (encoded by IANA as a
 * bare "2043", with no dash) go unnoticed.
 */
beforeEach(() => {
	vi.mocked(getCachedRegistry).mockImplementation(
		(type: RootRegistryType) => fixtures[type] ?? null
	);
	vi.mocked(getRegistry).mockImplementation((type: RootRegistryType) =>
		Promise.resolve(fixtures[type])
	);
});

const ARIN = "https://rdap.arin.net/registry/";
const RIPE = "https://rdap.db.ripe.net/";
const APNIC = "https://rdap.apnic.net/";
const LACNIC = "https://rdap.lacnic.net/rdap/";
const AFRINIC = "https://rdap.afrinic.net/rdap/";

describe("getRegistryURL - autnum", () => {
	// Real ASNs spanning all five RIRs. AS2043/AS2047 are IANA's only single-value
	// entries and are the regression cases for the bare-range bug.
	const cases: [string, number, string][] = [
		["Level 3", 1, ARIN],
		["DoD", 266, ARIN],
		["DoD upper edge", 271, ARIN],
		["single-value range", 2043, RIPE],
		["single-value range", 2047, RIPE],
		["RIPE NCC", 3333, RIPE],
		["China Telecom", 4134, ARIN],
		["APNIC training", 4608, APNIC],
		["AT&T", 7018, ARIN],
		["Cloudflare", 13335, ARIN],
		["Google", 15169, ARIN],
		["LACNIC block", 28000, LACNIC],
		["AFRINIC block", 37100, AFRINIC],
	];

	it.each(cases)("should resolve AS%#: %s (AS%d) to its RIR", async (_name, asn, base) => {
		await expect(getRegistryURL("autnum", `AS${asn}`)).resolves.toBe(`${base}autnum/${asn}`);
	});

	it.each([
		["uppercase", "AS13335"],
		["lowercase", "as13335"],
		["mixed case", "aS13335"],
		["leading zeroes", "AS0013335"],
		["many leading zeroes", "AS000000013335"],
	])("should normalize %s input to the canonical URL", async (_name, input) => {
		await expect(getRegistryURL("autnum", input)).resolves.toBe(`${ARIN}autnum/13335`);
	});

	it.each([
		["missing AS prefix", "13335"],
		["empty", ""],
		["prefix only", "AS"],
		["non-numeric", "ASfoo"],
		["embedded space", "AS 13335"],
		["decimal", "AS13335.5"],
		["negative", "AS-13335"],
		["asdot notation", "AS1.10"],
	])("should reject %s (%s)", async (_name, input) => {
		await expect(getRegistryURL("autnum", input)).rejects.toThrow(/Invalid ASN|No matching/);
	});

	it("should reject an ASN that no RIR has been allocated", async () => {
		// 65535 is reserved and absent from the bootstrap file.
		await expect(getRegistryURL("autnum", "AS65535")).rejects.toThrow("No matching registry");
	});

	it("should never emit the AS prefix in the query path", async () => {
		for (const [, asn] of cases) {
			const url = await getRegistryURL("autnum", `AS${asn}`);
			expect(url).toMatch(/\/autnum\/\d+$/);
			expect(url).not.toMatch(/AS\d/i);
		}
	});

	// The exhaustive pass: every range IANA publishes, at both inclusive bounds.
	it("should resolve both bounds of every published ASN range", async () => {
		const keys = allKeys("autnum");
		expect(keys.length).toBeGreaterThan(150);

		const failures: string[] = [];
		for (const { key, url } of keys) {
			const { start, end } = asnBounds(key);
			for (const asn of new Set([start, end])) {
				const resolved = await getRegistryURL("autnum", `AS${asn}`).catch(
					(error: Error) => `threw: ${error.message}`
				);
				const expected = `${url}autnum/${asn}`;
				if (resolved !== expected) {
					failures.push(`AS${asn} (range ${key}): expected ${expected}, got ${resolved}`);
				}
			}
		}

		expect(failures).toEqual([]);
	});
});

describe("getRegistryURL - ip4", () => {
	const cases: [string, string, string][] = [
		["Cloudflare DNS", "1.1.1.1", APNIC],
		["Google DNS", "8.8.8.8", ARIN],
		["RIPE NCC", "193.0.6.139", RIPE],
		["LACNIC space", "200.3.14.10", LACNIC],
		["AFRINIC space", "196.216.2.1", AFRINIC],
		["RFC1918 in ARIN space", "192.168.1.1", ARIN],
	];

	it.each(cases)("should resolve %s (%s)", async (_name, ip, base) => {
		await expect(getRegistryURL("ip4", ip)).resolves.toBe(`${base}ip/${ip}`);
	});

	it.each([
		["/24", "8.8.8.0/24"],
		["/16", "8.8.0.0/16"],
		["/32", "8.8.8.8/32"],
	])("should keep the CIDR suffix in the path for %s", async (_name, cidr) => {
		await expect(getRegistryURL("ip4", cidr)).resolves.toBe(`${ARIN}ip/${cidr}`);
	});

	it.each([
		["unallocated 0.0.0.0/8", "0.0.0.1"],
		["loopback, which no RIR is delegated", "127.0.0.1"],
	])("should reject %s (%s)", async (_name, ip) => {
		await expect(getRegistryURL("ip4", ip)).rejects.toThrow("No matching IPv4 registry");
	});

	// Every /8 IANA publishes: the block's own network address must resolve to it.
	it("should resolve the network address of every published IPv4 block", async () => {
		const keys = allKeys("ip4");
		expect(keys.length).toBeGreaterThan(200);

		const failures: string[] = [];
		for (const { key, url } of keys) {
			const [network] = key.split("/");
			const resolved = await getRegistryURL("ip4", network!).catch(
				(error: Error) => `threw: ${error.message}`
			);
			const expected = `${url}ip/${network}`;
			if (resolved !== expected) {
				failures.push(`${network} (block ${key}): expected ${expected}, got ${resolved}`);
			}
		}

		expect(failures).toEqual([]);
	});
});

describe("getRegistryURL - ip6", () => {
	const cases: [string, string, string][] = [
		["Google DNS", "2001:4860:4860::8888", ARIN],
		["Cloudflare DNS", "2606:4700:4700::1111", ARIN],
		["RIPE NCC", "2001:67c:2e8::1", RIPE],
		["APNIC space", "2001:200::1", APNIC],
		["LACNIC space", "2800::1", LACNIC],
		["AFRINIC space", "2c00::1", AFRINIC],
	];

	it.each(cases)("should resolve %s (%s)", async (_name, ip, base) => {
		await expect(getRegistryURL("ip6", ip)).resolves.toBe(`${base}ip/${ip}`);
	});

	it("should keep the CIDR suffix in the path", async () => {
		await expect(getRegistryURL("ip6", "2606:4700::/32")).resolves.toBe(
			`${ARIN}ip/2606:4700::/32`
		);
	});

	it("should reject an address in unallocated space", async () => {
		await expect(getRegistryURL("ip6", "::1")).rejects.toThrow("No matching IPv6 registry");
	});

	it("should resolve the network address of every published IPv6 block", async () => {
		const failures: string[] = [];
		for (const { key, url } of allKeys("ip6")) {
			const [network] = key.split("/");
			const resolved = await getRegistryURL("ip6", network!).catch(
				(error: Error) => `threw: ${error.message}`
			);
			const expected = `${url}ip/${network}`;
			if (resolved !== expected) {
				failures.push(`${network} (block ${key}): expected ${expected}, got ${resolved}`);
			}
		}

		expect(failures).toEqual([]);
	});
});

describe("getRegistryURL - domain", () => {
	it.each([
		["com", "example.com"],
		["net", "example.net"],
		["org", "example.org"],
		["dev", "example.dev"],
		["app", "example.app"],
		["subdomain", "www.example.com"],
		["deep subdomain", "a.b.c.d.example.com"],
		["uppercase", "EXAMPLE.COM"],
		["mixed case", "ExAmPlE.CoM"],
		["hyphenated label", "my-site.com"],
		["numeric label", "123.com"],
		["punycode", "example.xn--kpry57d"],
		["long punycode", "example.xn--vermgensberater-ctb"],
	])("should resolve a %s domain (%s)", async (_name, domain) => {
		const url = await getRegistryURL("domain", domain);
		expect(url).toMatch(/^https?:\/\/.+\/domain\//);
		expect(url.endsWith(`/domain/${domain}`)).toBe(true);
	});

	it("should reject a TLD that does not exist at all", async () => {
		global.fetch = vi
			.fn()
			.mockResolvedValue({ ok: true, text: () => Promise.resolve("com\nio\n") });

		await expect(getRegistryURL("domain", "example.invalidtld")).rejects.toThrow(
			"not recognized as a valid top-level domain"
		);
	});

	it("should distinguish a real TLD that has no RDAP server", async () => {
		// .io is a real TLD but IANA publishes no RDAP base URL for it, so the user
		// deserves "no RDAP" rather than "that TLD does not exist".
		global.fetch = vi
			.fn()
			.mockResolvedValue({ ok: true, text: () => Promise.resolve("com\nio\n") });

		await expect(getRegistryURL("domain", "example.io")).rejects.toThrow(
			"is not available in the IANA RDAP registry"
		);
	});

	// Every TLD IANA publishes an RDAP server for.
	it("should resolve a domain under every published TLD", async () => {
		const keys = allKeys("domain");
		expect(keys.length).toBeGreaterThan(1000);

		const failures: string[] = [];
		for (const { key, url } of keys) {
			const domain = `example.${key}`;
			const resolved = await getRegistryURL("domain", domain).catch(
				(error: Error) => `threw: ${error.message}`
			);
			const expected = `${url}domain/${domain}`;
			if (resolved !== expected) {
				failures.push(`${domain}: expected ${expected}, got ${resolved}`);
			}
		}

		expect(failures).toEqual([]);
	});
});

describe("getRegistryURL - entity", () => {
	it.each([
		["ARIN", "NET-ARIN", ARIN],
		["RIPE", "OPS4-RIPE", RIPE],
		["APNIC", "ABC-APNIC", APNIC],
		["LACNIC", "XYZ-LACNIC", LACNIC],
		["FRNIC", "HANDLE-FRNIC", "https://rdap.nic.fr/"],
		["NORID", "HANDLE-NORID", "https://rdap.norid.no/"],
	])("should resolve a %s handle (%s)", async (_name, handle, base) => {
		await expect(getRegistryURL("entity", handle)).resolves.toBe(`${base}entity/${handle}`);
	});

	it.each([
		["lowercase tag", "ops4-ripe"],
		["mixed case tag", "Ops4-Ripe"],
	])("should match the service tag case-insensitively (%s)", async (_name, handle) => {
		await expect(getRegistryURL("entity", handle)).resolves.toBe(`${RIPE}entity/${handle}`);
	});

	it("should use the last hyphen to find the tag", async () => {
		await expect(getRegistryURL("entity", "MULTI-PART-HANDLE-ARIN")).resolves.toBe(
			`${ARIN}entity/MULTI-PART-HANDLE-ARIN`
		);
	});

	it.each([
		["no hyphen", "HANDLE"],
		["trailing hyphen", "HANDLE-"],
	])("should reject %s (%s)", async (_name, handle) => {
		await expect(getRegistryURL("entity", handle)).rejects.toThrow(
			"Invalid entity handle format"
		);
	});

	it("should reject an unknown service tag", async () => {
		await expect(getRegistryURL("entity", "HANDLE-NOTREAL")).rejects.toThrow(
			"No matching registry"
		);
	});

	it("should resolve a handle for every published service tag", async () => {
		const failures: string[] = [];
		for (const entry of fixtures.entity.services) {
			const url = expectedURL(entry);
			for (const tag of entryKeys(entry)) {
				const handle = `TEST-${tag}`;
				const resolved = await getRegistryURL("entity", handle).catch(
					(error: Error) => `threw: ${error.message}`
				);
				const expected = `${url}entity/${handle}`;
				if (resolved !== expected) {
					failures.push(`${handle}: expected ${expected}, got ${resolved}`);
				}
			}
		}

		expect(failures).toEqual([]);
	});
});

describe("getRegistryURL - query parameters", () => {
	it.each([
		[{ jsContact: true }, "?jsContact=1"],
		[{ followReferral: true }, "?followReferral=1"],
		[{ jsContact: true, followReferral: true }, "?jsContact=1&followReferral=1"],
		[{ jsContact: false, followReferral: false }, ""],
		[undefined, ""],
	])("should append %o as %s", async (params, suffix) => {
		await expect(getRegistryURL("autnum", "AS13335", params)).resolves.toBe(
			`${ARIN}autnum/13335${suffix}`
		);
	});
});

describe("getRegistryURL - failure modes", () => {
	it("should throw when bootstrap data has not been loaded", async () => {
		vi.mocked(getCachedRegistry).mockReturnValue(null);
		await expect(getRegistryURL("autnum", "AS13335")).rejects.toThrow(
			"Cannot acquire RDAP URL without bootstrap data"
		);
	});

	it("should throw for an unrecognized registry type", async () => {
		await expect(getRegistryURL("nonsense" as RootRegistryType, "whatever")).rejects.toThrow();
	});
});

describe("bootstrap data invariants", () => {
	const types: RootRegistryType[] = ["autnum", "domain", "ip4", "ip6", "entity"];

	// URL construction concatenates the base and the path segment directly, so a base
	// without a trailing slash would silently produce "https://rdap.example.netdomain/x".
	it.each(types)("every %s bootstrap URL should end in a slash", (type) => {
		const offenders = fixtures[type].services
			.flatMap((entry) => (entry.length === 3 ? entry[2] : entry[1]))
			.filter((url) => !url.endsWith("/"));

		expect(offenders).toEqual([]);
	});

	it.each(types)("every %s entry should resolve to an https URL when one exists", (type) => {
		const offenders = fixtures[type].services
			.filter((entry) => {
				const urls = entry.length === 3 ? entry[2] : entry[1];
				return (
					urls.some((u) => u.startsWith("https://")) &&
					!expectedURL(entry).startsWith("https://")
				);
			})
			.map((entry) => expectedURL(entry));

		expect(offenders).toEqual([]);
	});
});
