import type { TargetType } from "@/rdap/schemas";
import { TargetTypeEnum } from "@/rdap/schemas";

/**
 * Represents the state that can be serialized to/from URL parameters.
 */
export type QueryUrlState = {
	query: string;
	type?: TargetType; // Only present if manually selected (not auto-detected)
};

/**
 * Serializes query state to URL query parameters.
 *
 * @param query - The lookup target (domain, IP, ASN, etc.)
 * @param type - The manually selected type (undefined for auto-detection)
 * @returns URL query parameters string (e.g., "?query=example.com&type=domain")
 */
export function serializeQueryToUrl(query: string, type?: TargetType | null): string {
	const params = new URLSearchParams();

	if (query) {
		params.set("query", query);
	}

	// Only include type if it was manually selected (not auto-detected)
	if (type != null) {
		params.set("type", type);
	}

	const paramString = params.toString();
	return paramString ? `?${paramString}` : "";
}

/**
 * Deserializes URL query parameters to query state.
 * Validates the type parameter against the TargetTypeEnum schema.
 *
 * @param searchParams - URLSearchParams object from the router
 * @returns QueryUrlState object with validated query and optional type
 */
export function deserializeUrlToQuery(searchParams: URLSearchParams): QueryUrlState | null {
	const query = searchParams.get("query");
	const typeParam = searchParams.get("type");

	// Query is required
	if (!query) {
		return null;
	}

	let type: TargetType | undefined;

	// Validate type parameter if present
	if (typeParam) {
		const result = TargetTypeEnum.safeParse(typeParam);
		if (result.success) {
			type = result.data;
		} else {
			// Invalid type parameter - ignore it and use auto-detection
			console.warn(`Invalid type parameter: ${typeParam}. Using auto-detection.`);
		}
	}

	return {
		query,
		type,
	};
}

/**
 * Builds a shareable URL for the current query.
 *
 * @param baseUrl - The base URL (e.g., window.location.origin + window.location.pathname)
 * @param query - The lookup target
 * @param type - The manually selected type (null/undefined for auto-detection)
 * @returns Complete shareable URL
 */
export function buildShareableUrl(
	baseUrl: string,
	query: string,
	type?: TargetType | null
): string {
	const queryString = serializeQueryToUrl(query, type);
	return `${baseUrl}${queryString}`;
}
