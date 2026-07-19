import { describe, it, expect } from "vitest";
import { asnInRange, findASN } from "@/lib/network";
import { allKeys, asnBounds } from "@/test/fixtures";

describe("asnInRange", () => {
	describe("basic matching", () => {
		it("should match ASN in single number range", () => {
			expect(asnInRange(100, "100-200")).toBe(true);
			expect(asnInRange(150, "100-200")).toBe(true);
			expect(asnInRange(200, "100-200")).toBe(true);
		});

		it("should not match ASN outside single number range", () => {
			expect(asnInRange(99, "100-200")).toBe(false);
			expect(asnInRange(201, "100-200")).toBe(false);
		});

		it("should match ASN at boundaries", () => {
			expect(asnInRange(1, "1-10")).toBe(true);
			expect(asnInRange(10, "1-10")).toBe(true);
		});

		it("should match single ASN (same start and end)", () => {
			expect(asnInRange(12345, "12345-12345")).toBe(true);
		});

		it("should not match single ASN outside", () => {
			expect(asnInRange(12346, "12345-12345")).toBe(false);
			expect(asnInRange(12344, "12345-12345")).toBe(false);
		});
	});

	describe("single-value ranges", () => {
		// IANA writes a one-ASN allocation without a dash. Fixtures that only ever
		// contained "start-end" ranges hid this for the whole life of the function.
		it.each([2043, 2047, 1, 65535, 4294967295])(
			"should match the bare range %d against itself",
			(asn) => {
				expect(asnInRange(asn, String(asn))).toBe(true);
			}
		);

		it.each([
			[2042, "2043"],
			[2044, "2043"],
			[0, "2043"],
		])("should not match %d against the bare range %s", (asn, range) => {
			expect(asnInRange(asn, range)).toBe(false);
		});
	});

	describe("ranges as IANA actually publishes them", () => {
		const ranges = allKeys("autnum");

		it("should cover every published range at both bounds", () => {
			const failures = ranges.filter(({ key }) => {
				const { start, end } = asnBounds(key);
				return !asnInRange(start, key) || !asnInRange(end, key);
			});

			expect(failures).toEqual([]);
			expect(ranges.length).toBeGreaterThan(150);
		});

		it("should exclude the ASN immediately outside every published range", () => {
			const failures = ranges.filter(({ key }) => {
				const { start, end } = asnBounds(key);
				return (start > 0 && asnInRange(start - 1, key)) || asnInRange(end + 1, key);
			});

			expect(failures).toEqual([]);
		});

		it("should assign every published range to exactly one registry", () => {
			// Overlapping ranges would make resolution order-dependent and therefore
			// silently dependent on IANA's ordering within the file.
			const overlaps: string[] = [];
			for (const { key, url } of ranges) {
				const { start } = asnBounds(key);
				const matches = ranges.filter((other) => asnInRange(start, other.key));
				const distinct = new Set(matches.map((m) => m.url));
				if (distinct.size > 1) {
					overlaps.push(`AS${start} (${key} -> ${url}) also matches ${[...distinct]}`);
				}
			}

			expect(overlaps).toEqual([]);
		});
	});

	describe("private ASN ranges", () => {
		it("should match 16-bit private ASN range", () => {
			// Private range: 64512-65534
			expect(asnInRange(64512, "64512-65534")).toBe(true);
			expect(asnInRange(65000, "64512-65534")).toBe(true);
			expect(asnInRange(65534, "64512-65534")).toBe(true);
		});

		it("should not match outside private range", () => {
			expect(asnInRange(64511, "64512-65534")).toBe(false);
			expect(asnInRange(65535, "64512-65534")).toBe(false);
		});

		it("should match 32-bit private ASN range", () => {
			// Private range: 4200000000-4294967294
			expect(asnInRange(4200000000, "4200000000-4294967294")).toBe(true);
			expect(asnInRange(4250000000, "4200000000-4294967294")).toBe(true);
			expect(asnInRange(4294967294, "4200000000-4294967294")).toBe(true);
		});
	});

	describe("large ASN numbers (32-bit)", () => {
		it("should handle large ASN numbers", () => {
			expect(asnInRange(4200000000, "4200000000-4294967294")).toBe(true);
			expect(asnInRange(4294967295, "4200000000-4294967294")).toBe(false);
		});

		it("should handle ASNs near 32-bit limit", () => {
			const maxAsn = 4294967295;
			expect(asnInRange(maxAsn, `${maxAsn}-${maxAsn}`)).toBe(true);
			expect(asnInRange(maxAsn - 1, `${maxAsn}-${maxAsn}`)).toBe(false);
		});
	});

	describe("findASN", () => {
		// findASN is exported but nothing in the application calls it; the resolver
		// uses asnInRange directly. These tests pin its behavior so its removal is a
		// deliberate decision rather than an accident.
		const sorted = ["1-100", "200-300", "400-500"];

		it.each([
			[1, 0],
			[50, 0],
			[100, 0],
			[200, 1],
			[300, 1],
			[450, 2],
		])("should locate AS%d at index %d", (asn, expected) => {
			expect(findASN(asn, sorted)).toBe(expected);
		});

		it.each([0, 150, 350, 600])("should return -1 for the unlisted AS%d", (asn) => {
			expect(findASN(asn, sorted)).toBe(-1);
		});

		it("should return -1 for an empty range list", () => {
			expect(findASN(100, [])).toBe(-1);
		});

		it("requires sorted input, unlike asnInRange", () => {
			// Binary search silently misses matches when ranges are out of order. The
			// resolver's linear asnInRange scan has no such requirement.
			const unsorted = ["200-300", "400-500", "1-100"];

			expect(findASN(50, unsorted)).toBe(-1);
			expect(unsorted.some((range) => asnInRange(50, range))).toBe(true);
		});
	});

	describe("edge cases", () => {
		it.each([
			["non-numeric", "invalid"],
			["missing end", "100-"],
			["missing start", "-100"],
			["three parts", "1-2-3"],
			["empty", ""],
		])("should reject a range with %s (%s)", (_name, range) => {
			expect(asnInRange(100, range)).toBe(false);
		});

		it("should handle negative numbers gracefully", () => {
			expect(asnInRange(-1, "1-100")).toBe(false);
			expect(asnInRange(50, "-100-100")).toBe(false);
		});

		it("should handle reversed ranges (end < start)", () => {
			// Invalid range where end is less than start
			expect(asnInRange(150, "200-100")).toBe(false);
		});

		it("should handle zero", () => {
			expect(asnInRange(0, "0-100")).toBe(true);
			expect(asnInRange(0, "1-100")).toBe(false);
		});
	});

	describe("ASN number parsing", () => {
		it("should handle number inputs", () => {
			expect(asnInRange(12345, "10000-20000")).toBe(true);
		});

		it("should handle very large numbers", () => {
			const largeAsn = 4000000000;
			expect(asnInRange(largeAsn, "3000000000-4294967295")).toBe(true);
			expect(asnInRange(largeAsn, "1-1000000000")).toBe(false);
		});
	});
});
