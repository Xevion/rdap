import type { JSCard, VCardArray } from "@/rdap/schemas";

/**
 * Unified contact data structure that normalizes both JSContact (RFC 9553)
 * and vCard (RFC 6350) formats into a consistent interface for display.
 */
export interface ParsedContact {
	/** Full display name of the contact */
	name?: string;

	/** Type of entity (individual, org, group, etc.) - JSContact only */
	kind?: string;

	/** List of organizations, with units joined by " > " */
	organizations?: string[];

	/** List of titles/roles */
	titles?: Array<{
		name: string;
		kind?: "title" | "role";
	}>;

	/** Email addresses with optional metadata */
	emails?: Array<{
		address: string;
		label?: string;
		contexts?: string[];
	}>;

	/** Phone numbers with optional metadata */
	phones?: Array<{
		number: string;
		features?: string[];
		label?: string;
	}>;

	/** Physical addresses */
	addresses?: Array<{
		text: string;
		details?: string[];
	}>;

	/** Online services (JSContact only) */
	onlineServices?: Array<{
		text: string;
		uri?: string;
		service?: string;
	}>;

	/** Web links/URLs */
	links?: Array<{
		uri: string;
		label?: string;
	}>;
}

/**
 * Parses a JSContact (RFC 9553) card into the unified ParsedContact format.
 * JSContact is the modern JSON-native alternative to vCard.
 */
export function parseJSContact(jscard: JSCard): ParsedContact {
	const contact: ParsedContact = {};

	// Extract display name
	if (jscard.name?.full) {
		contact.name = jscard.name.full;
	}

	// Extract kind (if not default "individual")
	if (jscard.kind && jscard.kind !== "individual") {
		contact.kind = jscard.kind;
	}

	// Extract organizations
	if (jscard.organizations) {
		contact.organizations = Object.values(jscard.organizations)
			.map((org) => {
				if (org.name && org.units) {
					return `${org.name} > ${org.units.map((u) => u.name).join(" > ")}`;
				}
				return org.name || org.units?.map((u) => u.name).join(" > ") || "";
			})
			.filter(Boolean);
	}

	// Extract titles/roles
	if (jscard.titles) {
		contact.titles = Object.values(jscard.titles).map((title) => ({
			name: title.name,
			kind: title.kind,
		}));
	}

	// Extract emails
	if (jscard.emails) {
		contact.emails = Object.values(jscard.emails).map((email) => ({
			address: email.address,
			label: email.label,
			contexts: email.contexts ? Object.keys(email.contexts) : undefined,
		}));
	}

	// Extract phones
	if (jscard.phones) {
		contact.phones = Object.values(jscard.phones).map((phone) => ({
			number: phone.number,
			features: phone.features ? Object.keys(phone.features) : undefined,
			label: phone.label,
		}));
	}

	// Extract addresses
	if (jscard.addresses) {
		contact.addresses = Object.values(jscard.addresses).map((addr) => {
			const text = addr.full || addr.components?.map((c) => c.value).join(", ") || "";
			const details = [addr.countryCode, addr.timeZone].filter(Boolean) as string[];

			return {
				text,
				details: details.length > 0 ? details : undefined,
			};
		});
	}

	// Extract online services
	if (jscard.onlineServices) {
		contact.onlineServices = Object.values(jscard.onlineServices).map((service) => ({
			text: service.service || service.user || service.uri || "",
			uri: service.uri,
			service: service.service,
		}));
	}

	// Extract links
	if (jscard.links) {
		contact.links = Object.values(jscard.links).map((link) => ({
			uri: link.uri,
			label: link.label,
		}));
	}

	return contact;
}

/**
 * Parses a vCard (jCard format, RFC 7095) into the unified ParsedContact format.
 * jCard is the JSON representation of vCard 4.0.
 */
export function parseVCard(vcardArray: VCardArray): ParsedContact {
	// Type for vCard property: [name, params, type, value]
	type VCardProperty = [string, Record<string, unknown>, string, unknown];

	const [, properties] = vcardArray;
	const contact: ParsedContact = {
		emails: [],
		phones: [],
		addresses: [],
		links: [],
		titles: [],
	};

	properties.forEach((prop: unknown) => {
		if (!Array.isArray(prop) || prop.length < 4) return;

		const [name, , , value] = prop as VCardProperty;
		const nameLower = name.toLowerCase();

		switch (nameLower) {
			case "fn": // Formatted name
				if (typeof value === "string") {
					contact.name = value;
				}
				break;

			case "org": // Organization
				if (Array.isArray(value)) {
					contact.organizations = [value.join(" > ")];
				} else if (typeof value === "string") {
					contact.organizations = [value];
				}
				break;

			case "email":
				if (typeof value === "string" && contact.emails) {
					contact.emails.push({ address: value });
				}
				break;

			case "tel": // Telephone
				if (typeof value === "string" && contact.phones) {
					contact.phones.push({ number: value });
				}
				break;

			case "adr": // Address [PO, extended, street, locality, region, postal, country]
				if (Array.isArray(value) && contact.addresses) {
					const addressParts = [
						value[2], // street
						value[3], // locality
						value[4], // region
						value[5], // postal
						value[6], // country
					].filter(Boolean);

					if (addressParts.length > 0) {
						contact.addresses.push({
							text: addressParts.join(", "),
						});
					}
				}
				break;

			case "url":
				if (typeof value === "string" && contact.links) {
					contact.links.push({ uri: value });
				}
				break;

			case "title":
				if (typeof value === "string" && contact.titles) {
					contact.titles.push({ name: value, kind: "title" });
				}
				break;

			case "role":
				if (typeof value === "string" && contact.titles) {
					contact.titles.push({ name: value, kind: "role" });
				}
				break;
		}
	});

	// Clean up empty arrays
	if (contact.emails?.length === 0) delete contact.emails;
	if (contact.phones?.length === 0) delete contact.phones;
	if (contact.addresses?.length === 0) delete contact.addresses;
	if (contact.links?.length === 0) delete contact.links;
	if (contact.titles?.length === 0) delete contact.titles;

	return contact;
}
