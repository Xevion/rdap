/**
 * Compares a given range to the value, returning the relative position.
 *
 * If the returned value is 1, the value sits AFTER the range.
 * If the returned value is 0, the value sits WITHIN the range.
 * If the returned value is -1, the value sits BEFORE the range.
 * The range given is considered to be inclusive (e.g. 6 sits WITHIN 6-10).
 *
 * @param value The value.
 * @param range The range, two positive numbers split by a single dash.
 * @returns {number} The relative position of the value to the range as -1, 0 or 1.
 */
function compareASN(value: number, range: string): number {
	const [start, end] = range.split("-", 2) as [string, string];
	if (value < parseInt(start)) return -1;
	if (value > parseInt(end)) return 1;
	return 0;
}

/**
 * Find the range in which a given ASN exists via binary search. If not found, -1 is used.
 */
export function findASN(asn: number, ranges: string[]) {
	let start = 0;
	let end = ranges.length - 1;

	while (start <= end) {
		const mid = Math.floor((start + end) / 2);
		const comparison = compareASN(asn, ranges[mid] as string);
		if (comparison == 0) return mid; // Success case
		if (comparison == -1) end = mid - 1;
		else start = mid + 1;
	}
	return -1; // Failure case
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
