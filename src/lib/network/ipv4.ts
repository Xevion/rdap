/**
 * Convert an IPv4 address string to a 32-bit integer
 */
function ipv4ToInt(ip: string): number {
	const parts = ip.split(".").map(Number);
	if (parts.length !== 4) return 0;
	const [a, b, c, d] = parts;
	if (a === undefined || b === undefined || c === undefined || d === undefined) return 0;
	return ((a << 24) | (b << 16) | (c << 8) | d) >>> 0;
}

/**
 * Check if an IPv4 address falls within a CIDR range
 * @param ip The IP address to check (e.g., "192.168.1.1")
 * @param cidr The CIDR range to check against (e.g., "192.168.0.0/16")
 * @returns true if the IP is within the CIDR range
 */
export function ipv4InCIDR(ip: string, cidr: string): boolean {
	const [rangeIp, prefixLenStr] = cidr.split("/");
	const prefixLen = parseInt(prefixLenStr ?? "", 10);

	if (!rangeIp || isNaN(prefixLen) || prefixLen < 0 || prefixLen > 32) {
		return false;
	}

	// Special case: /0 matches all IPs
	if (prefixLen === 0) {
		return true;
	}

	const ipInt = ipv4ToInt(ip);
	const rangeInt = ipv4ToInt(rangeIp);
	const mask = (0xffffffff << (32 - prefixLen)) >>> 0;

	return (ipInt & mask) === (rangeInt & mask);
}
