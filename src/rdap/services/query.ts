import type { AutonomousNumber, Domain, Entity, IpNetwork, TargetType } from "@/rdap/schemas";
import {
	AutonomousNumberSchema,
	DomainSchema,
	EntitySchema,
	IpNetworkSchema,
} from "@/rdap/schemas";
import { Result } from "true-myth";
import { loadBootstrap } from "@/rdap/services/registry";
import { getRegistryURL } from "@/rdap/services/resolver";
import { getAndParse } from "@/rdap/services/api";
import type { ParsedGeneric } from "@/rdap/components/RdapObjectRouter";

// An array of schemas to try and parse unknown JSON data with.
const schemas = [DomainSchema, AutonomousNumberSchema, IpNetworkSchema, EntitySchema];

/**
 * Custom error for HTTP security warnings that includes the URL for repeatability.
 */
export class HttpSecurityError extends Error {
	constructor(
		message: string,
		public url: string
	) {
		super(message);
		this.name = "HttpSecurityError";
	}
}

export interface RdapQueryOptions {
	requestJSContact: boolean;
	followReferral: boolean;
	/**
	 * Used to allow repeatable lookups when weird errors happen.
	 * If provided and matches the generated URL, will skip HTTP validation.
	 */
	repeatableUrl?: string;
}

export interface RdapQueryResult {
	data: ParsedGeneric;
	url: string;
}

/**
 * Execute an RDAP query for a given target and type.
 *
 * This function handles:
 * - Loading bootstrap data for the target type
 * - Constructing the appropriate RDAP URL
 * - Fetching and parsing the RDAP response
 * - Handling special cases (HTTP warnings, URL/JSON parsing, etc.)
 *
 * @param target - The lookup target (domain, IP, ASN, etc.)
 * @param targetType - The type of the target
 * @param options - Query options (jsContact, followReferral, repeatableUrl)
 * @returns A Result containing the parsed data and URL, or an error
 */
export async function executeRdapQuery(
	target: string,
	targetType: TargetType,
	options: RdapQueryOptions
): Promise<Result<RdapQueryResult, Error>> {
	if (target == null || target.length == 0) {
		return Result.err(new Error("A target must be given in order to execute a lookup."));
	}

	const { requestJSContact, followReferral, repeatableUrl } = options;

	// Prepare query parameters for RDAP requests
	const queryParams = { jsContact: requestJSContact, followReferral };

	switch (targetType) {
		// Block scoped case to allow url const reuse
		case "ip4": {
			await loadBootstrap("ip4");
			const url = getRegistryURL(targetType, target, queryParams);
			const result = await getAndParse<IpNetwork>(url, IpNetworkSchema, followReferral);
			if (result.isErr) return Result.err(result.error);
			return Result.ok({ data: result.value, url });
		}
		case "ip6": {
			await loadBootstrap("ip6");
			const url = getRegistryURL(targetType, target, queryParams);
			const result = await getAndParse<IpNetwork>(url, IpNetworkSchema, followReferral);
			if (result.isErr) return Result.err(result.error);
			return Result.ok({ data: result.value, url });
		}
		case "domain": {
			await loadBootstrap("domain");
			const url = getRegistryURL(targetType, target, queryParams);

			// HTTP
			if (url.startsWith("http://") && url != repeatableUrl) {
				return Result.err(
					new HttpSecurityError(
						"The registry this domain belongs to uses HTTP, which is not secure. " +
							"In order to prevent a cryptic error from appearing due to mixed active content, " +
							"or worse, a CORS error, this lookup has been blocked. Try again to force the lookup.",
						url
					)
				);
			}
			const result = await getAndParse<Domain>(url, DomainSchema, followReferral);
			if (result.isErr) return Result.err(result.error);

			return Result.ok({ data: result.value, url });
		}
		case "autnum": {
			await loadBootstrap("autnum");
			const url = getRegistryURL(targetType, target, queryParams);
			const result = await getAndParse<AutonomousNumber>(
				url,
				AutonomousNumberSchema,
				followReferral
			);
			if (result.isErr) return Result.err(result.error);
			return Result.ok({ data: result.value, url });
		}
		case "tld": {
			// remove the leading dot
			const value = target.startsWith(".") ? target.slice(1) : target;
			const params = new URLSearchParams();
			if (requestJSContact) params.append("jsContact", "1");
			if (followReferral) params.append("followReferral", "1");
			const queryString = params.toString();
			const baseUrl = `https://root.rdap.org/domain/${value}`;
			const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
			const result = await getAndParse<Domain>(url, DomainSchema, followReferral);
			if (result.isErr) return Result.err(result.error);
			return Result.ok({ data: result.value, url });
		}
		case "url": {
			const response = await fetch(target);

			if (response.status !== 200)
				return Result.err(
					new Error(
						`The URL provided returned a non-200 status code: ${response.status}.`
					)
				);

			const data = await response.json();

			// Try each schema until one works
			for (const schema of schemas) {
				const result = schema.safeParse(data);
				if (result.success) return Result.ok({ data: result.data, url: target });
			}

			return Result.err(new Error("No schema was able to parse the response."));
		}
		case "json": {
			try {
				const data = JSON.parse(target);
				for (const schema of schemas) {
					const result = schema.safeParse(data);
					if (result.success) return Result.ok({ data: result.data, url: "" });
				}
			} catch (e) {
				return Result.err(new Error("Invalid JSON format", { cause: e }));
			}
			return Result.err(new Error("No schema was able to parse the JSON."));
		}
		case "entity": {
			await loadBootstrap("entity");
			const url = getRegistryURL(targetType, target, queryParams);
			const result = await getAndParse<Entity>(url, EntitySchema, followReferral);
			if (result.isErr) return Result.err(result.error);
			return Result.ok({ data: result.value, url });
		}
		case "registrar":
			return Result.err(
				new Error(
					"Registrar lookups are not supported as a separate type. " +
						"In RDAP, registrars are entity objects. Please use the entity type with the registrar's handle (e.g., IANA ID format)."
				)
			);
		default:
			return Result.err(new Error("The type detected has not been implemented."));
	}
}
