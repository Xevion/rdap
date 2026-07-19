import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RootRegistryType } from "@/rdap/schemas";
import { registryURLs } from "@/rdap/constants";
import { fixtures } from "@/test/fixtures";

const TYPES: RootRegistryType[] = ["autnum", "domain", "ip4", "ip6", "entity"];

/**
 * registry.ts holds module-level cache state, so each test imports a fresh copy
 * rather than inheriting whatever a previous test loaded.
 */
async function freshRegistry() {
	vi.resetModules();
	return import("@/rdap/services/registry");
}

function respondWith(body: unknown, status = 200) {
	const fetchMock = vi.fn().mockResolvedValue({
		status,
		statusText: status === 200 ? "OK" : "Server Error",
		json: () => Promise.resolve(body),
	});
	global.fetch = fetchMock;
	return fetchMock;
}

beforeEach(() => {
	vi.restoreAllMocks();
});

describe("loadBootstrap", () => {
	it.each(TYPES)("should fetch the documented IANA URL for %s", async (type) => {
		const fetchMock = respondWith(fixtures[type]);
		const { loadBootstrap } = await freshRegistry();

		await loadBootstrap(type);

		expect(fetchMock).toHaveBeenCalledWith(registryURLs[type]);
	});

	it("should not refetch a registry that is already cached", async () => {
		const fetchMock = respondWith(fixtures.autnum);
		const { loadBootstrap } = await freshRegistry();

		await loadBootstrap("autnum");
		await loadBootstrap("autnum");

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("should refetch when forced", async () => {
		const fetchMock = respondWith(fixtures.autnum);
		const { loadBootstrap } = await freshRegistry();

		await loadBootstrap("autnum");
		await loadBootstrap("autnum", true);

		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("should cache each type independently", async () => {
		const fetchMock = respondWith(fixtures.autnum);
		const { loadBootstrap } = await freshRegistry();

		await loadBootstrap("autnum");
		await loadBootstrap("domain");

		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("should throw on a non-200 response", async () => {
		respondWith({}, 503);
		const { loadBootstrap } = await freshRegistry();

		await expect(loadBootstrap("autnum")).rejects.toThrow("Server Error");
	});

	it("should throw when the payload does not match RegisterSchema", async () => {
		respondWith({ description: "broken" });
		const { loadBootstrap } = await freshRegistry();

		await expect(loadBootstrap("autnum")).rejects.toThrow("Could not parse IANA bootstrap");
	});

	it("should leave the cache empty after a failed load", async () => {
		respondWith({}, 500);
		const { loadBootstrap, getCachedRegistry } = await freshRegistry();

		await expect(loadBootstrap("autnum")).rejects.toThrow();
		expect(getCachedRegistry("autnum")).toBeNull();
	});
});

describe("getRegistry", () => {
	it("should load on demand when nothing is cached", async () => {
		const fetchMock = respondWith(fixtures.autnum);
		const { getRegistry } = await freshRegistry();

		const registry = await getRegistry("autnum");

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(registry.services.length).toBe(fixtures.autnum.services.length);
	});

	it("should reuse the cache on a second call", async () => {
		const fetchMock = respondWith(fixtures.autnum);
		const { getRegistry } = await freshRegistry();

		await getRegistry("autnum");
		await getRegistry("autnum");

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});

describe("getCachedRegistry", () => {
	it.each(TYPES)("should return null for %s before it is loaded", async (type) => {
		const { getCachedRegistry } = await freshRegistry();

		expect(getCachedRegistry(type)).toBeNull();
	});

	it("should return the registry once loaded", async () => {
		respondWith(fixtures.domain);
		const { loadBootstrap, getCachedRegistry } = await freshRegistry();

		await loadBootstrap("domain");

		expect(getCachedRegistry("domain")?.services.length).toBe(fixtures.domain.services.length);
	});

	it("should not report other types as loaded", async () => {
		respondWith(fixtures.domain);
		const { loadBootstrap, getCachedRegistry } = await freshRegistry();

		await loadBootstrap("domain");

		expect(getCachedRegistry("autnum")).toBeNull();
	});
});
