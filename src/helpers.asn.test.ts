import { describe, it, expect } from "vitest";
import { asnInRange } from "./helpers";

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

	describe("real-world ASN ranges from IANA", () => {
		// ARIN ranges
		it("should match ARIN ASN ranges", () => {
			// ARIN typically has ranges like 1-1876, 1902-2042, etc.
			expect(asnInRange(100, "1-1876")).toBe(true);
			expect(asnInRange(1876, "1-1876")).toBe(true);
			expect(asnInRange(2000, "1902-2042")).toBe(true);
		});

		// RIPE ranges
		it("should match RIPE ASN ranges", () => {
			// RIPE has ranges like 1877-1901, 2043-2109, etc.
			expect(asnInRange(1900, "1877-1901")).toBe(true);
			expect(asnInRange(2100, "2043-2109")).toBe(true);
		});

		// APNIC ranges
		it("should match APNIC ASN ranges", () => {
			// APNIC has ranges like 2110-2136, 4608-4864, etc.
			expect(asnInRange(2120, "2110-2136")).toBe(true);
			expect(asnInRange(4700, "4608-4864")).toBe(true);
		});

		// Well-known ASNs
		it("should match Google ASN (AS15169)", () => {
			// Google's ASN 15169 falls in range that includes it
			expect(asnInRange(15169, "15000-16000")).toBe(true);
			expect(asnInRange(15169, "15169-15169")).toBe(true);
			expect(asnInRange(15169, "15360-16383")).toBe(false); // Not in this range
		});

		it("should match Cloudflare ASN (AS13335)", () => {
			// Cloudflare's ASN 13335 should be in ARIN range 13312-18431
			expect(asnInRange(13335, "13312-18431")).toBe(true);
		});

		it("should match Amazon ASN (AS16509)", () => {
			// Amazon's ASN 16509
			expect(asnInRange(16509, "15360-16383")).toBe(false);
			expect(asnInRange(16509, "16384-18431")).toBe(true);
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

	describe("edge cases", () => {
		it("should handle invalid range format", () => {
			expect(asnInRange(100, "invalid")).toBe(false);
			expect(asnInRange(100, "100")).toBe(false);
			expect(asnInRange(100, "100-")).toBe(false);
			expect(asnInRange(100, "-100")).toBe(false);
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
