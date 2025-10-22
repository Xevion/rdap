import type { Register, RootRegistryType, TargetType } from "@/types";
import { Result } from "true-myth";

export function domainMatchPredicate(domain: string): (tld: string) => boolean {
	return (tld) => domainMatch(tld, domain);
}

export function domainMatch(tld: string, domain: string): boolean {
	return domain.toUpperCase().endsWith(`.${tld.toUpperCase()}`);
}

// return the first HTTPS url, or the first URL
export function getBestURL(urls: [string, ...string[]]): string {
	urls.forEach((url) => {
		if (url.startsWith("https://")) return url;
	});
	return urls[0];
}

type ValidatorArgs = {
	value: string;
	getRegistry: (type: RootRegistryType) => Promise<Register>;
};

/**
 * Validator result types:
 * - false: didn't match this type, try next validator
 * - true: matched and valid
 * - string: matched but invalid (error message)
 */
type ValidatorResult = boolean | string;

/**
 * Type validators in priority order (most specific to most generic).
 * Order matters: url/json/tld are checked before domain to avoid false matches.
 */
const TypeValidators = new Map<TargetType, (args: ValidatorArgs) => Promise<ValidatorResult>>([
	["url", ({ value }) => Promise.resolve(/^https?:/.test(value))],
	["json", ({ value }) => Promise.resolve(/^{/.test(value))],
	["tld", ({ value }) => Promise.resolve(/^\.\w+$/.test(value))],
	[
		"ip4",
		({ value }) => {
			// Basic format check
			const match = value.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(\/\d{1,2})?$/);
			if (!match) return Promise.resolve(false);

			// Validate each octet is 0-255
			const octets = [match[1], match[2], match[3], match[4]];
			for (let i = 0; i < octets.length; i++) {
				const octet = parseInt(octets[i] ?? "", 10);
				if (isNaN(octet) || octet < 0 || octet > 255) {
					return Promise.resolve(
						`Invalid IPv4 address: octet ${i + 1} (${octets[i] ?? "undefined"}) must be 0-255`
					);
				}
			}

			// Validate CIDR prefix if present
			if (match[5]) {
				const prefix = parseInt(match[5].substring(1), 10);
				if (isNaN(prefix) || prefix < 0 || prefix > 32) {
					return Promise.resolve("Invalid IPv4 address: CIDR prefix must be 0-32");
				}
			}

			return Promise.resolve(true);
		},
	],
	[
		"ip6",
		({ value }) => {
			// Basic format check (hex characters, colons, optional CIDR)
			const match = value.match(/^([0-9a-fA-F:]+)(\/\d{1,3})?$/);
			if (!match) return Promise.resolve(false);

			const ipPart = match[1] ?? "";

			// Check for invalid characters
			if (!/^[0-9a-fA-F:]+$/.test(ipPart)) {
				return Promise.resolve("Invalid IPv6 address: contains invalid characters");
			}

			// Validate double :: only appears once
			const doubleColonCount = (ipPart.match(/::/g) || []).length;
			if (doubleColonCount > 1) {
				return Promise.resolve("Invalid IPv6 address: :: can only appear once");
			}

			// Validate CIDR prefix if present
			if (match[2]) {
				const prefix = parseInt(match[2].substring(1), 10);
				if (isNaN(prefix) || prefix < 0 || prefix > 128) {
					return Promise.resolve("Invalid IPv6 address: CIDR prefix must be 0-128");
				}
			}

			return Promise.resolve(true);
		},
	],
	["autnum", ({ value }) => Promise.resolve(/^AS\d+$/i.test(value))],
	[
		"entity",
		async ({ value, getRegistry }) => {
			// Ensure the entity handle is in the correct format
			const result = value.match(/^\w+-(\w+)$/);
			if (result === null || result.length <= 1 || result[1] == undefined) return false;

			// Check if the entity object tag is real
			try {
				const registry = await getRegistry("entity");

				// Check each service to see if tag matches
				// Entity registry structure: [email, tags, urls]
				for (const service of registry.services) {
					const tags = service[1]; // Tags are at index 1 (0=email, 1=tags, 2=urls)
					if (
						tags.some(
							(tag) => tag.toUpperCase() === (result[1] as string).toUpperCase()
						)
					)
						return true;
				}

				return false;
			} catch (e) {
				console.error(new Error("Failed to fetch entity registry", { cause: e }));
				return false;
			}
		},
	],
	[
		"domain",
		({ value }) => {
			// Case-insensitive domain matching with support for multiple labels
			// Matches: example.com, www.example.com, a.b.c.d.example.net, etc.
			return Promise.resolve(
				/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(
					value
				)
			);
		},
	],
	["registrar", () => Promise.resolve(false)],
]);

/**
 * Retrieves the precise type of a given value based on matching patterns.
 *
 * Validators are checked in priority order (most specific to most generic).
 * If a validator matches but the value is invalid, an error is returned immediately
 * without trying subsequent validators.
 *
 * @param value - The value to determine the type for.
 * @returns A `Result` object containing the determined `TargetType` if a match is found,
 *          or an `Error` if the value is invalid or no patterns match.
 */
export async function getType(
	value: string,
	getRegistry: (type: RootRegistryType) => Promise<Register>
): Promise<Result<TargetType, Error>> {
	for (const [type, validator] of TypeValidators.entries()) {
		const result = await validator({ value, getRegistry });

		if (result === false) {
			// Didn't match this type, try next validator
			continue;
		} else if (result === true) {
			// Matched and valid
			return Result.ok(type);
		} else {
			// Matched but invalid (result is error message)
			return Result.err(new Error(result));
		}
	}

	return Result.err(new Error("No patterns matched the input"));
}
