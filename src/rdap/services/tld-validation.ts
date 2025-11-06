/**
 * TLD validation service
 * Validates domain TLDs against:
 * 1. Complete IANA TLD list (all valid TLDs)
 * 2. RDAP DNS registry (TLDs with RDAP support)
 */

export type TldValidationResult =
	| { type: "valid" }
	| { type: "no-rdap"; tld: string }
	| { type: "invalid"; tld: string };

// Cache for IANA TLD list
let tldListCache: Set<string> | null = null;
let tldListCacheExpiry: number | null = null;

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const IANA_TLD_LIST_URL = "https://data.iana.org/TLD/tlds-alpha-by-domain.txt";

/**
 * Load the complete IANA TLD list from official source
 */
async function loadIanaTldList(): Promise<Set<string>> {
	// Check in-memory cache first
	const now = Date.now();
	if (tldListCache && tldListCacheExpiry && now < tldListCacheExpiry) {
		return tldListCache;
	}

	try {
		const response = await fetch(IANA_TLD_LIST_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch IANA TLD list: ${response.statusText}`);
		}

		const text = await response.text();

		// Parse file - format is one TLD per line, comments start with #
		const tlds = text
			.split("\n")
			.map((line) => line.trim().toLowerCase())
			.filter((line) => line && !line.startsWith("#"));

		tldListCache = new Set(tlds);
		tldListCacheExpiry = now + CACHE_TTL;

		return tldListCache;
	} catch (error) {
		// If fetch fails, return empty set to fail gracefully
		console.error("Failed to load IANA TLD list:", error);
		return new Set();
	}
}

/**
 * Extract TLD from domain (rightmost label after final dot)
 */
export function extractTld(domain: string): string | null {
	const parts = domain.split(".");
	if (parts.length < 2) {
		return null;
	}
	const tld = parts[parts.length - 1];
	return tld ? tld.toLowerCase() : null;
}

/**
 * Check if TLD exists in official IANA TLD list
 */
async function isValidTld(tld: string): Promise<boolean> {
	const tldList = await loadIanaTldList();

	// If list couldn't be loaded, assume valid to avoid false positives
	if (tldList.size === 0) {
		return true;
	}

	return tldList.has(tld.toLowerCase());
}

/**
 * Check if TLD has RDAP support in IANA DNS registry
 */
async function isRdapAvailable(tld: string): Promise<boolean> {
	try {
		const { getRegistry } = await import("./registry");
		const registry = await getRegistry("domain");

		// Check if TLD appears in any registry service
		return registry.services.some((service) =>
			service[0].some((registryTld) => registryTld.toLowerCase() === tld.toLowerCase())
		);
	} catch (error) {
		// If registry can't be loaded, assume no RDAP available
		console.error("Failed to check RDAP availability:", error);
		return false;
	}
}

/**
 * Validate domain TLD against IANA list and RDAP registry
 * Returns validation result indicating if TLD is valid, has RDAP, or is invalid
 */
export async function validateDomainTld(domain: string): Promise<TldValidationResult> {
	const tld = extractTld(domain);

	if (!tld) {
		return { type: "invalid", tld: domain };
	}

	const [isValid, hasRdap] = await Promise.all([isValidTld(tld), isRdapAvailable(tld)]);

	if (!isValid) {
		return { type: "invalid", tld };
	}

	if (!hasRdap) {
		return { type: "no-rdap", tld };
	}

	return { type: "valid" };
}
