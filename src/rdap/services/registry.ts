import type { Register, RootRegistryType } from "@/rdap/schemas";
import { RegisterSchema } from "@/rdap/schemas";
import { registryURLs } from "@/rdap/constants";

/**
 * Registry cache to avoid re-fetching bootstrap data
 */
const registryCache: Record<RootRegistryType, Register | null> = {
	autnum: null,
	domain: null,
	ip4: null,
	ip6: null,
	entity: null,
};

/**
 * Fetch & load a specific registry's bootstrap data
 */
export async function loadBootstrap(type: RootRegistryType, force = false): Promise<void> {
	// Early exit if already loaded and not forcing
	if (registryCache[type] != null && !force) return;

	// Fetch the bootstrapping file from the registry
	const response = await fetch(registryURLs[type]);
	if (response.status != 200) throw new Error(`Error: ${response.statusText}`);

	// Parse it to ensure data integrity
	const parsedRegister = RegisterSchema.safeParse(await response.json());
	if (!parsedRegister.success)
		throw new Error(`Could not parse IANA bootstrap response (type: ${type}).`);

	// Cache the result
	registryCache[type] = parsedRegister.data;
}

/**
 * Get a registry's bootstrap data, loading it if necessary
 */
export async function getRegistry(type: RootRegistryType): Promise<Register> {
	if (registryCache[type] == null) await loadBootstrap(type);
	const registry = registryCache[type];
	if (registry == null) throw new Error(`Could not load bootstrap data for ${type} registry.`);
	return registry;
}

/**
 * Get the cached registry data (or null if not loaded)
 */
export function getCachedRegistry(type: RootRegistryType): Register | null {
	return registryCache[type];
}
