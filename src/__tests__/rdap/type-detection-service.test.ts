import { describe, it, expect } from "vitest";
import {
	detectTargetType,
	validateTargetType,
	generateValidationWarning,
	generateBootstrapWarning,
} from "@/rdap/services/type-detection";
import type { RootRegistryType, TargetType } from "@/rdap/schemas";
import { fixtures } from "@/test/fixtures";

const getRegistry = (type: RootRegistryType) => Promise.resolve(fixtures[type]);

describe("detectTargetType", () => {
	it.each([
		["example.com", "domain"],
		["AS13335", "autnum"],
		["1.1.1.1", "ip4"],
		["2606:4700::1", "ip6"],
		["TEST-ARIN", "entity"],
		[".com", "tld"],
		["https://rdap.arin.net/registry/autnum/13335", "url"],
		['{"objectClassName":"domain"}', "json"],
	] as [string, TargetType][])("should detect %s as %s", async (input, expected) => {
		const result = await detectTargetType(input, getRegistry);

		expect(result.isOk).toBe(true);
		if (result.isOk) expect(result.value).toBe(expected);
	});

	it.each(["", "!!!", "not a valid anything at all"])(
		"should fail to detect a type for %s",
		async (input) => {
			const result = await detectTargetType(input, getRegistry);

			expect(result.isErr).toBe(true);
		}
	);
});

describe("validateTargetType", () => {
	it.each([
		["example.com", "domain"],
		["AS13335", "autnum"],
		["1.1.1.1", "ip4"],
		["2606:4700::1", "ip6"],
		["TEST-ARIN", "entity"],
	] as [string, TargetType][])("should accept %s as %s", async (input, type) => {
		const result = await validateTargetType(input, type, getRegistry);

		expect(result.isOk).toBe(true);
	});

	it.each([
		["example.com", "autnum"],
		["AS13335", "domain"],
		["1.1.1.1", "ip6"],
	] as [string, TargetType][])("should reject %s as %s", async (input, type) => {
		const result = await validateTargetType(input, type, getRegistry);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error).toContain("does not match the format");
	});

	it("should surface the specific reason a matched type is invalid", async () => {
		const result = await validateTargetType("999.1.1.1", "ip4", getRegistry);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error).toContain("octet 1");
	});

	it("should reject a type with no validator", async () => {
		const result = await validateTargetType("x", "nonsense" as TargetType, getRegistry);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error).toContain("Unknown type");
	});
});

describe("generateValidationWarning", () => {
	it("should name both the problem and the type being used anyway", () => {
		expect(generateValidationWarning("input looks wrong", "domain")).toBe(
			'Warning: input looks wrong. Proceeding with selected type "domain".'
		);
	});
});

describe("generateBootstrapWarning", () => {
	it("should include a truncated error message", () => {
		const warning = generateBootstrapWarning(
			new Error("a very long failure message that will not fit")
		);

		expect(warning).toBe("Failed to preload registry(a very long ...)");
	});

	it.each([
		["a string", "boom"],
		["null", null],
		["undefined", undefined],
	])("should degrade gracefully for %s", (_name, thrown) => {
		expect(generateBootstrapWarning(thrown)).toBe("Failed to preload registry.");
	});
});
