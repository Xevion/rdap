import { describe, it, expect } from "vitest";
import { parseJSContact, parseVCard } from "@/rdap/contact-parser";
import type { JSCard, VCardArray } from "@/rdap/schemas";

describe("parseJSContact", () => {
	it("extracts full name", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			name: {
				full: "John Doe",
			},
		};

		const result = parseJSContact(jscard);

		expect(result.name).toBe("John Doe");
	});

	it("extracts kind when not individual", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			kind: "org",
		};

		const result = parseJSContact(jscard);

		expect(result.kind).toBe("org");
	});

	it("does not extract kind when individual", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			kind: "individual",
		};

		const result = parseJSContact(jscard);

		expect(result.kind).toBeUndefined();
	});

	it("extracts organization with name only", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			organizations: {
				org1: {
					name: "ACME Corp",
				},
			},
		};

		const result = parseJSContact(jscard);

		expect(result.organizations).toEqual(["ACME Corp"]);
	});

	it("combines organization name with units", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			organizations: {
				org1: {
					name: "ACME Corp",
					units: [{ name: "Engineering" }, { name: "Backend" }],
				},
			},
		};

		const result = parseJSContact(jscard);

		expect(result.organizations).toEqual(["ACME Corp > Engineering > Backend"]);
	});

	it("extracts titles with kinds", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			titles: {
				t1: {
					name: "Software Engineer",
					kind: "title",
				},
				t2: {
					name: "Tech Lead",
					kind: "role",
				},
			},
		};

		const result = parseJSContact(jscard);

		expect(result.titles).toEqual([
			{ name: "Software Engineer", kind: "title" },
			{ name: "Tech Lead", kind: "role" },
		]);
	});

	it("extracts emails with metadata", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			emails: {
				e1: {
					address: "john@example.com",
					label: "Work",
					contexts: { work: true },
				},
				e2: {
					address: "john.personal@example.com",
				},
			},
		};

		const result = parseJSContact(jscard);

		expect(result.emails).toEqual([
			{
				address: "john@example.com",
				label: "Work",
				contexts: ["work"],
			},
			{
				address: "john.personal@example.com",
				label: undefined,
				contexts: undefined,
			},
		]);
	});

	it("extracts phones with features", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			phones: {
				p1: {
					number: "+1-555-0100",
					features: { voice: true, text: true },
					label: "Mobile",
				},
			},
		};

		const result = parseJSContact(jscard);

		expect(result.phones).toEqual([
			{
				number: "+1-555-0100",
				features: ["voice", "text"],
				label: "Mobile",
			},
		]);
	});

	it("extracts addresses with full text", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			addresses: {
				a1: {
					full: "123 Main St, Springfield, USA",
					countryCode: "US",
					timeZone: "America/New_York",
				},
			},
		};

		const result = parseJSContact(jscard);

		expect(result.addresses).toEqual([
			{
				text: "123 Main St, Springfield, USA",
				details: ["US", "America/New_York"],
			},
		]);
	});

	it("extracts addresses from components when full is missing", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			addresses: {
				a1: {
					components: [
						{ value: "123 Main St" },
						{ value: "Springfield" },
						{ value: "USA" },
					],
				},
			},
		};

		const result = parseJSContact(jscard);

		expect(result.addresses).toEqual([
			{
				text: "123 Main St, Springfield, USA",
				details: undefined,
			},
		]);
	});

	it("extracts online services", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			onlineServices: {
				s1: {
					uri: "https://github.com/johndoe",
					service: "GitHub",
					user: "johndoe",
				},
			},
		};

		const result = parseJSContact(jscard);

		expect(result.onlineServices).toEqual([
			{
				text: "GitHub",
				uri: "https://github.com/johndoe",
				service: "GitHub",
			},
		]);
	});

	it("extracts links", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "test-uid",
			links: {
				l1: {
					uri: "https://example.com",
					label: "Website",
				},
				l2: {
					uri: "https://blog.example.com",
				},
			},
		};

		const result = parseJSContact(jscard);

		expect(result.links).toEqual([
			{ uri: "https://example.com", label: "Website" },
			{ uri: "https://blog.example.com", label: undefined },
		]);
	});

	it("handles complete JSCard with all fields", () => {
		const jscard: JSCard = {
			"@type": "Card",
			version: "1.0",
			uid: "complete-test",
			kind: "individual",
			name: {
				full: "Jane Smith",
			},
			organizations: {
				org1: { name: "Tech Corp" },
			},
			titles: {
				t1: { name: "CTO" },
			},
			emails: {
				e1: { address: "jane@tech.com" },
			},
			phones: {
				p1: { number: "+1-555-0200" },
			},
			addresses: {
				a1: { full: "456 Oak Ave" },
			},
			onlineServices: {
				s1: { uri: "https://twitter.com/jane" },
			},
			links: {
				l1: { uri: "https://jane.tech" },
			},
		};

		const result = parseJSContact(jscard);

		expect(result).toEqual({
			name: "Jane Smith",
			organizations: ["Tech Corp"],
			titles: [{ name: "CTO", kind: undefined }],
			emails: [{ address: "jane@tech.com", label: undefined, contexts: undefined }],
			phones: [{ number: "+1-555-0200", features: undefined, label: undefined }],
			addresses: [{ text: "456 Oak Ave", details: undefined }],
			onlineServices: [
				{
					text: "https://twitter.com/jane",
					uri: "https://twitter.com/jane",
					service: undefined,
				},
			],
			links: [{ uri: "https://jane.tech", label: undefined }],
		});
	});
});

describe("parseVCard", () => {
	it("handles minimal vCard with only FN", () => {
		const vcard: VCardArray = ["vcard", [["fn", {}, "text", "John Doe"]]];

		const result = parseVCard(vcard);

		expect(result.name).toBe("John Doe");
		expect(result.emails).toBeUndefined();
		expect(result.phones).toBeUndefined();
	});

	it("extracts organization as string", () => {
		const vcard: VCardArray = [
			"vcard",
			[
				["fn", {}, "text", "John Doe"],
				["org", {}, "text", "ACME Corp"],
			],
		];

		const result = parseVCard(vcard);

		expect(result.organizations).toEqual(["ACME Corp"]);
	});

	it("extracts organization as array with units", () => {
		const vcard: VCardArray = [
			"vcard",
			[
				["fn", {}, "text", "John Doe"],
				["org", {}, "text", ["ACME Corp", "Engineering", "Backend"]],
			],
		];

		const result = parseVCard(vcard);

		expect(result.organizations).toEqual(["ACME Corp > Engineering > Backend"]);
	});

	it("extracts multiple emails", () => {
		const vcard: VCardArray = [
			"vcard",
			[
				["fn", {}, "text", "John Doe"],
				["email", {}, "text", "john@work.com"],
				["email", {}, "text", "john@personal.com"],
			],
		];

		const result = parseVCard(vcard);

		expect(result.emails).toEqual([
			{ address: "john@work.com" },
			{ address: "john@personal.com" },
		]);
	});

	it("extracts multiple phones", () => {
		const vcard: VCardArray = [
			"vcard",
			[
				["fn", {}, "text", "John Doe"],
				["tel", {}, "text", "+1-555-0100"],
				["tel", {}, "text", "+1-555-0200"],
			],
		];

		const result = parseVCard(vcard);

		expect(result.phones).toEqual([{ number: "+1-555-0100" }, { number: "+1-555-0200" }]);
	});

	it("extracts structured address", () => {
		const vcard: VCardArray = [
			"vcard",
			[
				["fn", {}, "text", "John Doe"],
				["adr", {}, "text", ["", "", "123 Main St", "Springfield", "IL", "62701", "USA"]],
			],
		];

		const result = parseVCard(vcard);

		expect(result.addresses).toEqual([
			{
				text: "123 Main St, Springfield, IL, 62701, USA",
			},
		]);
	});

	it("extracts URLs", () => {
		const vcard: VCardArray = [
			"vcard",
			[
				["fn", {}, "text", "John Doe"],
				["url", {}, "text", "https://example.com"],
				["url", {}, "text", "https://blog.example.com"],
			],
		];

		const result = parseVCard(vcard);

		expect(result.links).toEqual([
			{ uri: "https://example.com" },
			{ uri: "https://blog.example.com" },
		]);
	});

	it("extracts title and role separately", () => {
		const vcard: VCardArray = [
			"vcard",
			[
				["fn", {}, "text", "John Doe"],
				["title", {}, "text", "Software Engineer"],
				["role", {}, "text", "Tech Lead"],
			],
		];

		const result = parseVCard(vcard);

		expect(result.titles).toEqual([
			{ name: "Software Engineer", kind: "title" },
			{ name: "Tech Lead", kind: "role" },
		]);
	});

	it("handles complete vCard with all fields", () => {
		const vcard: VCardArray = [
			"vcard",
			[
				["fn", {}, "text", "Jane Smith"],
				["org", {}, "text", "Tech Corp"],
				["title", {}, "text", "CTO"],
				["email", {}, "text", "jane@tech.com"],
				["tel", {}, "text", "+1-555-0300"],
				["adr", {}, "text", ["", "", "456 Oak Ave", "Boston", "MA", "02101", "USA"]],
				["url", {}, "text", "https://jane.tech"],
			],
		];

		const result = parseVCard(vcard);

		expect(result).toEqual({
			name: "Jane Smith",
			organizations: ["Tech Corp"],
			titles: [{ name: "CTO", kind: "title" }],
			emails: [{ address: "jane@tech.com" }],
			phones: [{ number: "+1-555-0300" }],
			addresses: [{ text: "456 Oak Ave, Boston, MA, 02101, USA" }],
			links: [{ uri: "https://jane.tech" }],
		});
	});

	it("ignores malformed properties", () => {
		const vcard: VCardArray = [
			"vcard",
			[
				["fn", {}, "text", "John Doe"],
				["invalid"], // Too short
				null, // Not an array
				["email"], // Missing required fields
			],
		];

		const result = parseVCard(vcard);

		expect(result.name).toBe("John Doe");
		expect(result.emails).toBeUndefined();
	});
});
