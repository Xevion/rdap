import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeRdapQuery, HttpSecurityError } from "@/rdap/services/query";
import { loadBootstrap } from "@/rdap/services/registry";
import { getRegistryURL } from "@/rdap/services/resolver";
import { getAndParse, NotFoundError } from "@/rdap/services/api";
import type * as ApiModule from "@/rdap/services/api";
import { Result } from "true-myth";
import type { TargetType } from "@/rdap/schemas";

vi.mock("@/rdap/services/registry", () => ({ loadBootstrap: vi.fn() }));
vi.mock("@/rdap/services/resolver", () => ({ getRegistryURL: vi.fn() }));
vi.mock("@/rdap/services/api", async (importOriginal) => {
	// NotFoundError must stay real so instanceof checks in query.ts still work.
	const actual = await importOriginal<typeof ApiModule>();
	return { ...actual, getAndParse: vi.fn() };
});

const OPTIONS = { requestJSContact: false, followReferral: false };

const domainObject = { objectClassName: "domain", ldhName: "example.com" };

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(loadBootstrap).mockResolvedValue(undefined);
	vi.mocked(getRegistryURL).mockResolvedValue("https://rdap.example.test/domain/example.com");
	vi.mocked(getAndParse).mockResolvedValue(Result.ok(domainObject));
});

describe("executeRdapQuery - input handling", () => {
	it.each([
		["null", null],
		["undefined", undefined],
		["empty string", ""],
	])("should reject a %s target", async (_name, target) => {
		const result = await executeRdapQuery(target as unknown as string, "domain", OPTIONS);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error.message).toContain("A target must be given");
	});
});

describe("executeRdapQuery - bootstrap loading", () => {
	it.each([
		["ip4", "1.1.1.1"],
		["ip6", "2606:4700::1"],
		["domain", "example.com"],
		["autnum", "AS13335"],
		["entity", "TEST-ARIN"],
	] as [TargetType, string][])(
		"should load the %s bootstrap before resolving",
		async (type, target) => {
			await executeRdapQuery(target, type, OPTIONS);

			expect(loadBootstrap).toHaveBeenCalledWith(type);
		}
	);

	it.each([
		["tld", ".com"],
		["json", "{}"],
	] as [TargetType, string][])("should not load a bootstrap for %s", async (type, target) => {
		await executeRdapQuery(target, type, OPTIONS);

		expect(loadBootstrap).not.toHaveBeenCalled();
	});
});

describe("executeRdapQuery - not-found messages", () => {
	beforeEach(() => {
		vi.mocked(getAndParse).mockResolvedValue(
			Result.err(new NotFoundError("gone", "https://rdap.example.test/x"))
		);
	});

	it.each([
		["domain", "example.com", /The domain "example.com" was not found/],
		["autnum", "AS13335", /autonomous system number "AS13335" was not found/],
		["ip4", "1.1.1.1", /The IP address "1.1.1.1" was not found/],
		["ip6", "2606:4700::1", /The IP address "2606:4700::1" was not found/],
		["entity", "TEST-ARIN", /The entity "TEST-ARIN" was not found/],
		["tld", ".com", /The TLD "\.com" was not found/],
	] as [TargetType, string, RegExp][])(
		"should describe a 404 for %s in terms the user typed",
		async (type, target, expected) => {
			const result = await executeRdapQuery(target, type, OPTIONS);

			expect(result.isErr).toBe(true);
			if (result.isErr) expect(result.error.message).toMatch(expected);
		}
	);
});

describe("executeRdapQuery - http security gate", () => {
	beforeEach(() => {
		vi.mocked(getRegistryURL).mockResolvedValue("http://rdap.insecure.test/domain/example.com");
	});

	it("should block a plaintext http domain registry", async () => {
		const result = await executeRdapQuery("example.com", "domain", OPTIONS);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.error).toBeInstanceOf(HttpSecurityError);
			expect((result.error as HttpSecurityError).url).toBe(
				"http://rdap.insecure.test/domain/example.com"
			);
		}
	});

	it("should allow the same url through on an explicit retry", async () => {
		const result = await executeRdapQuery("example.com", "domain", {
			...OPTIONS,
			repeatableUrl: "http://rdap.insecure.test/domain/example.com",
		});

		expect(result.isOk).toBe(true);
	});
});

describe("executeRdapQuery - tld", () => {
	it("should query the root zone directly", async () => {
		const result = await executeRdapQuery(".com", "tld", OPTIONS);

		expect(result.isOk).toBe(true);
		if (result.isOk) expect(result.value.url).toBe("https://root.rdap.org/domain/com");
	});

	it("should accept a tld without the leading dot", async () => {
		const result = await executeRdapQuery("com", "tld", OPTIONS);

		expect(result.isOk).toBe(true);
		if (result.isOk) expect(result.value.url).toBe("https://root.rdap.org/domain/com");
	});

	it.each([
		[{ requestJSContact: true, followReferral: false }, "?jsContact=1"],
		[{ requestJSContact: false, followReferral: true }, "?followReferral=1"],
		[{ requestJSContact: true, followReferral: true }, "?jsContact=1&followReferral=1"],
		[{ requestJSContact: false, followReferral: false }, ""],
	])("should append %o to the root zone url", async (options, suffix) => {
		const result = await executeRdapQuery(".com", "tld", options);

		expect(result.isOk).toBe(true);
		if (result.isOk) expect(result.value.url).toBe(`https://root.rdap.org/domain/com${suffix}`);
	});
});

describe("executeRdapQuery - json", () => {
	it("should parse an inline rdap object", async () => {
		const result = await executeRdapQuery(JSON.stringify(domainObject), "json", OPTIONS);

		expect(result.isOk).toBe(true);
		if (result.isOk) expect(result.value.url).toBe("");
	});

	it("should reject malformed json", async () => {
		const result = await executeRdapQuery("{not json", "json", OPTIONS);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error.message).toContain("Invalid JSON format");
	});

	it("should reject json that matches no rdap schema", async () => {
		const result = await executeRdapQuery('{"foo":"bar"}', "json", OPTIONS);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error.message).toContain("No schema was able to parse");
	});
});

describe("executeRdapQuery - url", () => {
	it("should reject a non-200 response", async () => {
		global.fetch = vi.fn().mockResolvedValue({ status: 500, json: () => Promise.resolve({}) });

		const result = await executeRdapQuery("https://rdap.example.test/x", "url", OPTIONS);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error.message).toContain("non-200 status code: 500");
	});

	it("should parse a response matching an rdap schema", async () => {
		global.fetch = vi
			.fn()
			.mockResolvedValue({ status: 200, json: () => Promise.resolve(domainObject) });

		const result = await executeRdapQuery("https://rdap.example.test/x", "url", OPTIONS);

		expect(result.isOk).toBe(true);
		if (result.isOk) expect(result.value.url).toBe("https://rdap.example.test/x");
	});
});

describe("executeRdapQuery - unsupported types", () => {
	it("should explain that registrars are entities", async () => {
		const result = await executeRdapQuery("123", "registrar", OPTIONS);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error.message).toContain("Registrar lookups are not");
	});

	it("should reject a type it does not implement", async () => {
		const result = await executeRdapQuery("x", "nonsense" as TargetType, OPTIONS);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error.message).toContain("has not been implemented");
	});
});
