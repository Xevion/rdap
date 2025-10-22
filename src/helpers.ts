import type { SyntheticEvent } from "react";

declare global {
	interface ObjectConstructor {
		entries<T extends object>(o: T): [keyof T, T[keyof T]][];
	}
}

export function truthy(value: string | null | undefined) {
	if (value == undefined) return false;
	return value.toLowerCase() == "true" || value == "1";
}

export function onPromise<T>(promise: (event: SyntheticEvent) => Promise<T>) {
	return (event: SyntheticEvent) => {
		if (promise) {
			promise(event).catch((error) => {
				console.log("Unexpected error", error);
			});
		}
	};
}

/**
 * Truncate a string dynamically to ensure maxLength is not exceeded & an ellipsis is used.
 * Behavior undefined when ellipsis exceeds {maxLength}.
 * @param input The input string
 * @param maxLength A positive number representing the maximum length the input string should be.
 * @param ellipsis A string representing what should be placed on the end when the max length is hit.
 */
export function truncated(input: string, maxLength: number, ellipsis = "...") {
	if (maxLength <= 0) return "";
	if (input.length <= maxLength) return input;
	return input.substring(0, Math.max(0, maxLength - ellipsis.length)) + ellipsis;
}

export function preventDefault(event: SyntheticEvent | Event) {
	event.preventDefault();
}

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

/**
 * Check if an ASN falls within a range
 * @param asn The ASN number to check (e.g., 13335 for Cloudflare)
 * @param range The range to check against (e.g., "13312-18431")
 * @returns true if the ASN is within the range
 */
export function asnInRange(asn: number, range: string): boolean {
	const parts = range.split("-");

	if (parts.length !== 2) {
		return false;
	}

	const start = parseInt(parts[0] ?? "", 10);
	const end = parseInt(parts[1] ?? "", 10);

	if (isNaN(start) || isNaN(end) || start < 0 || end < 0 || start > end) {
		return false;
	}

	if (asn < 0) {
		return false;
	}

	return asn >= start && asn <= end;
}
