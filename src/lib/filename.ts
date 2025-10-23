import type { ParsedGeneric } from "@/rdap/components/RdapObjectRouter";

/**
 * Attempts to convert an IP range to CIDR notation
 * Returns the CIDR notation if possible, otherwise returns null
 */
function tryConvertToCIDR(
	startAddress: string,
	endAddress: string,
	ipVersion: "v4" | "v6"
): string | null {
	if (ipVersion === "v4") {
		// Parse IPv4 addresses
		const startParts = startAddress.split(".").map(Number);
		const endParts = endAddress.split(".").map(Number);

		if (
			startParts.length !== 4 ||
			endParts.length !== 4 ||
			startParts.some((part) => part === undefined) ||
			endParts.some((part) => part === undefined)
		) {
			return null;
		}

		// Convert to 32-bit integers - TypeScript now knows these are defined
		const startInt =
			(startParts[0]! << 24) +
			(startParts[1]! << 16) +
			(startParts[2]! << 8) +
			startParts[3]!;
		const endInt =
			(endParts[0]! << 24) + (endParts[1]! << 16) + (endParts[2]! << 8) + endParts[3]!;

		// Calculate the number of addresses in the range
		const rangeSize = endInt - startInt + 1;

		// Check if it's a power of 2 (valid CIDR block)
		if ((rangeSize & (rangeSize - 1)) !== 0) return null;

		// Calculate prefix length
		const prefixLength = 32 - Math.log2(rangeSize);

		// Verify that startInt is aligned to the CIDR block
		const mask = 0xffffffff << (32 - prefixLength);
		if ((startInt & mask) !== startInt) return null;

		return `${startAddress}/${prefixLength}`;
	}

	// For IPv6, basic implementation - can be extended later
	// For now, just return null for IPv6 ranges
	return null;
}

/**
 * Extracts a meaningful identifier from the RDAP data
 */
function extractIdentifier(data: ParsedGeneric): string {
	switch (data.objectClassName) {
		case "domain":
			return data.ldhName ?? data.unicodeName ?? data.handle ?? "unknown";

		case "ip network": {
			// Try to convert to CIDR first
			const cidr = tryConvertToCIDR(data.startAddress, data.endAddress, data.ipVersion);
			if (cidr != null) {
				return cidr;
			}
			// Fall back to range notation with underscore separator
			return `${data.startAddress}_${data.endAddress}`;
		}

		case "autnum": {
			const prefix =
				data.startAutnum === data.endAutnum
					? `AS${data.startAutnum}`
					: `AS${data.startAutnum}-${data.endAutnum}`;
			return prefix;
		}

		case "entity":
			return data.handle ?? "unknown";

		case "nameserver":
			return data.ldhName ?? data.unicodeName ?? data.handle ?? "unknown";

		default:
			return "unknown";
	}
}

/**
 * Formats a Date object to YYYYMMDD-HHMMSS format
 */
function formatTimestamp(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const seconds = String(date.getSeconds()).padStart(2, "0");

	return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Sanitizes a filename by replacing unsafe characters
 * Replaces characters that are problematic in filenames across different OS
 */
function sanitizeFilename(filename: string): string {
	return filename
		.replace(/[<>:"|?*]/g, "_") // Windows reserved characters
		.replace(/\//g, "_") // Path separator
		.replace(/\\/g, "_") // Windows path separator
		.replace(/\s+/g, "-") // Replace whitespace with dashes
		.replace(/[^\x20-\x7E]/g, "_") // Replace non-printable ASCII with underscores
		.replace(/_+/g, "_") // Collapse multiple underscores
		.replace(/-+/g, "-"); // Collapse multiple dashes
}

/**
 * Generates a descriptive filename for downloading RDAP data
 * Format: rdap-{type}-{identifier}-{timestamp}.json
 *
 * @param data - The RDAP response data
 * @param timestamp - The timestamp when the query was completed (optional)
 * @returns A sanitized filename for the download
 */
export function generateDownloadFilename(data: ParsedGeneric, timestamp?: Date): string {
	const type = data.objectClassName.replace(" ", "-");
	const identifier = extractIdentifier(data);
	const timestampStr = timestamp != null ? formatTimestamp(timestamp) : "";

	const parts = ["rdap", type, identifier];
	if (timestampStr !== "") {
		parts.push(timestampStr);
	}

	const filename = parts.join("-") + ".json";
	return sanitizeFilename(filename);
}
