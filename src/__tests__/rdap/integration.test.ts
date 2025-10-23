// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getType } from "@/rdap/utils";
import type { Register, RootRegistryType } from "@/rdap/schemas";
import { registryURLs } from "@/rdap/constants";

// Integration tests that fetch real IANA bootstrap data
// These are slower but test against actual registries
// Note: Uses Node.js environment instead of happy-dom to allow real network requests

const registryCache = new Map<RootRegistryType, Register>();

async function getRealRegistry(type: RootRegistryType): Promise<Register> {
	if (registryCache.has(type)) {
		return registryCache.get(type)!;
	}

	const response = await fetch(registryURLs[type]);
	if (!response.ok) {
		throw new Error(`Failed to fetch ${type} registry: ${response.statusText}`);
	}

	const data = (await response.json()) as Register;
	registryCache.set(type, data);
	return data;
}

describe("getType - Integration tests with real registries", () => {
	it("should detect entity with real entity registry", async () => {
		// Test with a known entity tag (RIPE)
		const result = await getType("TEST-RIPE", getRealRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("entity");
		}
	}, 10000); // Longer timeout for network call

	it("should detect entity with ARIN tag", async () => {
		const result = await getType("NET-ARIN", getRealRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("entity");
		}
	}, 10000);

	it("should not detect invalid entity tag", async () => {
		const result = await getType("INVALID-NOTREAL", getRealRegistry);
		// Should either error or detect as something else, but not entity
		if (result.isOk) {
			expect(result.value).not.toBe("entity");
		}
	}, 10000);
});
