/**
 * Expand IPv6 address shorthand notation
 */
function expandIPv6(ip: string): string {
	if (ip.includes("::")) {
		const [left, right] = ip.split("::");
		const leftParts = left ? left.split(":") : [];
		const rightParts = right ? right.split(":") : [];
		const missingParts = 8 - leftParts.length - rightParts.length;
		const middleParts: string[] = Array(missingParts).fill("0") as string[];
		const allParts = [...leftParts, ...middleParts, ...rightParts];
		return allParts.map((p: string) => p.padStart(4, "0")).join(":");
	}
	return ip
		.split(":")
		.map((p: string) => p.padStart(4, "0"))
		.join(":");
}

/**
 * Convert an IPv6 address to a BigInt representation
 */
function ipv6ToBigInt(ip: string): bigint {
	// Expand :: notation
	const expandedIp = expandIPv6(ip);
	const parts = expandedIp.split(":");

	let result = BigInt(0);
	for (const part of parts) {
		result = (result << BigInt(16)) | BigInt(parseInt(part, 16));
	}
	return result;
}

/**
 * Check if an IPv6 address falls within a CIDR range
 * @param ip The IPv6 address to check (e.g., "2001:db8::1")
 * @param cidr The CIDR range to check against (e.g., "2001:db8::/32")
 * @returns true if the IP is within the CIDR range
 */
export function ipv6InCIDR(ip: string, cidr: string): boolean {
	const [rangeIp, prefixLenStr] = cidr.split("/");
	const prefixLen = parseInt(prefixLenStr ?? "", 10);

	if (!rangeIp || isNaN(prefixLen) || prefixLen < 0 || prefixLen > 128) {
		return false;
	}

	try {
		const ipInt = ipv6ToBigInt(ip);
		const rangeInt = ipv6ToBigInt(rangeIp);
		const maxMask = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
		const mask = (maxMask << BigInt(128 - prefixLen)) & maxMask;

		return (ipInt & mask) === (rangeInt & mask);
	} catch {
		return false;
	}
}
