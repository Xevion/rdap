import type { RootRegistryType } from "@/rdap/schemas";
import { getCachedRegistry } from "@/rdap/services/registry";
import { domainMatchPredicate, getBestURL } from "@/rdap/utils";
import { ipv4InCIDR, ipv6InCIDR, asnInRange } from "@/lib/network";

export interface URLQueryParams {
	jsContact?: boolean;
	followReferral?: boolean;
}

/**
 * Resolve the RDAP URL for a given registry type and lookup target
 */
export function getRegistryURL(
	type: RootRegistryType,
	lookupTarget: string,
	queryParams?: URLQueryParams
): string {
	const bootstrap = getCachedRegistry(type);
	if (bootstrap == null)
		throw new Error(`Cannot acquire RDAP URL without bootstrap data for ${type} lookup.`);

	let url: string | null = null;

	typeSwitch: switch (type) {
		case "domain":
			for (const bootstrapItem of bootstrap.services) {
				if (bootstrapItem[0].some(domainMatchPredicate(lookupTarget))) {
					// min length of 1 is validated in zod schema
					url = getBestURL(bootstrapItem[1] as [string, ...string[]]);
					break typeSwitch;
				}
			}
			throw new Error(`No matching domain found.`);
		case "ip4": {
			// Extract the IP address without CIDR suffix for matching
			const [ipAddress] = lookupTarget.split("/");
			if (!ipAddress) throw new Error(`Invalid IPv4 format: ${lookupTarget}`);
			for (const bootstrapItem of bootstrap.services) {
				// bootstrapItem[0] contains CIDR ranges like ["1.0.0.0/8", "2.0.0.0/8"]
				if (bootstrapItem[0].some((cidr) => ipv4InCIDR(ipAddress, cidr))) {
					url = getBestURL(bootstrapItem[1] as [string, ...string[]]);
					break typeSwitch;
				}
			}
			throw new Error(`No matching IPv4 registry found for ${lookupTarget}.`);
		}
		case "ip6": {
			// Extract the IP address without CIDR suffix for matching
			const [ipAddress] = lookupTarget.split("/");
			if (!ipAddress) throw new Error(`Invalid IPv6 format: ${lookupTarget}`);
			for (const bootstrapItem of bootstrap.services) {
				// bootstrapItem[0] contains CIDR ranges like ["2001:0200::/23", "2001:0400::/23"]
				if (bootstrapItem[0].some((cidr) => ipv6InCIDR(ipAddress, cidr))) {
					url = getBestURL(bootstrapItem[1] as [string, ...string[]]);
					break typeSwitch;
				}
			}
			throw new Error(`No matching IPv6 registry found for ${lookupTarget}.`);
		}
		case "autnum": {
			// Extract ASN number from "AS12345" format
			const asnMatch = lookupTarget.match(/^AS(\d+)$/i);
			if (!asnMatch || !asnMatch[1]) {
				throw new Error(`Invalid ASN format: ${lookupTarget}`);
			}

			const asnNumber = parseInt(asnMatch[1], 10);
			if (isNaN(asnNumber)) {
				throw new Error(`Invalid ASN number: ${lookupTarget}`);
			}

			for (const bootstrapItem of bootstrap.services) {
				// bootstrapItem[0] contains ASN ranges like ["64512-65534", "13312-18431"]
				if (bootstrapItem[0].some((range) => asnInRange(asnNumber, range))) {
					url = getBestURL(bootstrapItem[1] as [string, ...string[]]);
					break typeSwitch;
				}
			}
			throw new Error(`No matching registry found for ${lookupTarget}.`);
		}
		case "entity":
			throw new Error(`No matching entity found.`);
		default:
			throw new Error("Invalid lookup target provided.");
	}

	if (url == null) throw new Error("No lookup target was resolved.");

	// Map internal types to RDAP endpoint paths
	// ip4 and ip6 both use the 'ip' endpoint in RDAP
	const rdapPath = type === "ip4" || type === "ip6" ? "ip" : type;

	// Build query parameters string
	const params = new URLSearchParams();
	if (queryParams?.jsContact) {
		params.append("jsContact", "1");
	}
	if (queryParams?.followReferral) {
		params.append("followReferral", "1");
	}

	const queryString = params.toString();
	const baseUrl = `${url}${rdapPath}/${lookupTarget}`;

	return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
