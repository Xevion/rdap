import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRegistryURL } from "@/rdap/services/resolver";
import { getCachedRegistry } from "@/rdap/services/registry";
import type { Register } from "@/rdap/schemas";

vi.mock("@/rdap/services/registry", () => ({
	getRegistry: vi.fn(),
	getCachedRegistry: vi.fn(),
}));

const asnRegistry: Register = {
	description: "test",
	publication: "2024-01-01T00:00:00Z",
	version: "1.0",
	services: [
		[["13312-15359"], ["https://rdap.arin.net/registry/"]],
		[["64512-65534"], ["https://rdap.example.net/"]],
	],
};

describe("getRegistryURL (autnum)", () => {
	beforeEach(() => {
		vi.mocked(getCachedRegistry).mockReturnValue(asnRegistry);
	});

	it("should strip the AS prefix from the query path", async () => {
		await expect(getRegistryURL("autnum", "AS13335")).resolves.toBe(
			"https://rdap.arin.net/registry/autnum/13335"
		);
	});

	it("should accept a lowercase AS prefix", async () => {
		await expect(getRegistryURL("autnum", "as13335")).resolves.toBe(
			"https://rdap.arin.net/registry/autnum/13335"
		);
	});

	it("should normalize leading zeroes", async () => {
		await expect(getRegistryURL("autnum", "AS0013335")).resolves.toBe(
			"https://rdap.arin.net/registry/autnum/13335"
		);
	});

	it("should preserve query parameters", async () => {
		await expect(getRegistryURL("autnum", "AS13335", { jsContact: true })).resolves.toBe(
			"https://rdap.arin.net/registry/autnum/13335?jsContact=1"
		);
	});

	it("should reject a target without an AS prefix", async () => {
		await expect(getRegistryURL("autnum", "13335")).rejects.toThrow("Invalid ASN format");
	});
});
