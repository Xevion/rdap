import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractTld, validateDomainTld } from "@/rdap/services/tld-validation";
import type { Register } from "@/rdap/schemas";

// Mock the registry module
vi.mock("@/rdap/services/registry", () => ({
	getRegistry: vi.fn(),
	getCachedRegistry: vi.fn(),
}));

describe("extractTld", () => {
	it("should extract TLD from standard domain", () => {
		expect(extractTld("example.com")).toBe("com");
	});

	it("should extract TLD from subdomain", () => {
		expect(extractTld("www.example.com")).toBe("com");
	});

	it("should extract TLD from multiple subdomain levels", () => {
		expect(extractTld("api.staging.example.com")).toBe("com");
	});

	it("should return null for single label domain", () => {
		expect(extractTld("localhost")).toBeNull();
	});

	it("should return null for empty string", () => {
		expect(extractTld("")).toBeNull();
	});

	it("should handle uppercase TLDs", () => {
		expect(extractTld("example.COM")).toBe("com");
	});

	it("should handle mixed case domains", () => {
		expect(extractTld("Example.CoM")).toBe("com");
	});
});

describe("validateDomainTld", () => {
	beforeEach(() => {
		// Reset mocks before each test
		vi.resetModules();
	});

	describe("with mocked IANA TLD list", () => {
		beforeEach(async () => {
			// Mock fetch for IANA TLD list
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				text: () =>
					Promise.resolve(
						`# IANA TLD list
com
net
org
test
localhost
example
invalid`
					),
			});

			// Mock the registry module to return test data
			const { getRegistry } = await import("@/rdap/services/registry");
			vi.mocked(getRegistry).mockResolvedValue({
				description: "Test DNS registry",
				publication: "2024-01-01",
				version: "1.0",
				services: [
					[["com", "net", "org"], ["https://rdap.example.com/"]],
					// test, localhost, example, invalid are NOT in RDAP registry
				],
			} as Register);
		});

		it("should return valid for TLD with RDAP support", async () => {
			const result = await validateDomainTld("example.com");
			expect(result).toEqual({ type: "valid" });
		});

		it("should return no-rdap for valid TLD without RDAP support", async () => {
			const result = await validateDomainTld("example.test");
			expect(result).toEqual({ type: "no-rdap", tld: "test" });
		});

		it("should return invalid for non-existent TLD", async () => {
			const result = await validateDomainTld("example.notreal");
			expect(result).toEqual({ type: "invalid", tld: "notreal" });
		});

		it("should handle subdomains correctly", async () => {
			const result = await validateDomainTld("www.example.com");
			expect(result).toEqual({ type: "valid" });
		});

		it("should return invalid for single-label domain", async () => {
			const result = await validateDomainTld("localhost");
			expect(result).toEqual({ type: "invalid", tld: "localhost" });
		});

		it("should handle case-insensitive TLDs", async () => {
			const result = await validateDomainTld("example.COM");
			expect(result).toEqual({ type: "valid" });
		});
	});

	describe("with fetch failures", () => {
		beforeEach(async () => {
			// Mock fetch to fail for IANA TLD list
			global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

			// Mock the registry module
			const { getRegistry } = await import("@/rdap/services/registry");
			vi.mocked(getRegistry).mockResolvedValue({
				description: "Test DNS registry",
				publication: "2024-01-01",
				version: "1.0",
				services: [[["com"], ["https://rdap.example.com/"]]],
			} as Register);
		});

		it("should gracefully handle IANA list fetch failure", async () => {
			const result = await validateDomainTld("example.com");
			// Should assume valid when IANA list can't be loaded
			expect(result).toEqual({ type: "valid" });
		});
	});
});

describe("getRegistryURL error messages", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	describe("domain TLD errors", () => {
		beforeEach(async () => {
			// Mock fetch for IANA TLD list
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				text: () =>
					Promise.resolve(
						`# IANA TLD list
com
net
test`
					),
			});

			// Mock the registry module
			const { getCachedRegistry, getRegistry } = await import("@/rdap/services/registry");

			vi.mocked(getCachedRegistry).mockReturnValue({
				description: "Test DNS registry",
				publication: "2024-01-01",
				version: "1.0",
				services: [
					[["com", "net"], ["https://rdap.example.com/"]],
					// test is NOT in RDAP registry
				],
			} as Register);

			vi.mocked(getRegistry).mockResolvedValue({
				description: "Test DNS registry",
				publication: "2024-01-01",
				version: "1.0",
				services: [
					[["com", "net"], ["https://rdap.example.com/"]],
					// test is NOT in RDAP registry
				],
			} as Register);
		});

		it("should throw enhanced error for invalid TLD", async () => {
			const { getRegistryURL } = await import("@/rdap/services/resolver");

			await expect(getRegistryURL("domain", "example.invalidtld")).rejects.toThrow(
				'The TLD ".invalidtld" is not recognized as a valid top-level domain'
			);
		});

		it("should throw enhanced error for valid TLD without RDAP", async () => {
			const { getRegistryURL } = await import("@/rdap/services/resolver");

			await expect(getRegistryURL("domain", "example.test")).rejects.toThrow(
				'The TLD ".test" exists but is not available in the IANA RDAP registry'
			);
		});

		it("should throw error for malformed domain", async () => {
			const { getRegistryURL } = await import("@/rdap/services/resolver");

			await expect(getRegistryURL("domain", "noextension")).rejects.toThrow(
				'Invalid domain format: "noextension"'
			);
		});

		it("should not throw error for valid domain with RDAP", async () => {
			const { getRegistryURL } = await import("@/rdap/services/resolver");

			await expect(getRegistryURL("domain", "example.com")).resolves.toContain(
				"https://rdap.example.com/domain/example.com"
			);
		});
	});
});
