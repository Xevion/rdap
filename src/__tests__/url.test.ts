import { describe, it, expect } from "vitest";
import { serializeQueryToUrl, deserializeUrlToQuery, buildShareableUrl } from "@/lib/urls";

describe("URL Utilities", () => {
	describe("serializeQueryToUrl", () => {
		it("should serialize query without type (auto-detection)", () => {
			const result = serializeQueryToUrl("example.com");
			expect(result).toBe("?query=example.com");
		});

		it("should serialize query with manually selected type", () => {
			const result = serializeQueryToUrl("example.com", "domain");
			expect(result).toBe("?query=example.com&type=domain");
		});

		it("should handle null type as auto-detection", () => {
			const result = serializeQueryToUrl("8.8.8.8", null);
			expect(result).toBe("?query=8.8.8.8");
		});

		it("should handle empty query", () => {
			const result = serializeQueryToUrl("");
			expect(result).toBe("");
		});

		it("should URL-encode special characters", () => {
			const result = serializeQueryToUrl("test value with spaces");
			expect(result).toBe("?query=test+value+with+spaces");
		});
	});

	describe("deserializeUrlToQuery", () => {
		it("should deserialize query without type", () => {
			const params = new URLSearchParams("?query=example.com");
			const result = deserializeUrlToQuery(params);
			expect(result).toEqual({
				query: "example.com",
				type: undefined,
			});
		});

		it("should deserialize query with valid type", () => {
			const params = new URLSearchParams("?query=example.com&type=domain");
			const result = deserializeUrlToQuery(params);
			expect(result).toEqual({
				query: "example.com",
				type: "domain",
			});
		});

		it("should ignore invalid type parameter", () => {
			const params = new URLSearchParams("?query=example.com&type=invalid");
			const result = deserializeUrlToQuery(params);
			expect(result).toEqual({
				query: "example.com",
				type: undefined,
			});
		});

		it("should return null for missing query", () => {
			const params = new URLSearchParams("?type=domain");
			const result = deserializeUrlToQuery(params);
			expect(result).toBeNull();
		});

		it("should return null for empty params", () => {
			const params = new URLSearchParams("");
			const result = deserializeUrlToQuery(params);
			expect(result).toBeNull();
		});

		it("should handle all valid target types", () => {
			const types = [
				"autnum",
				"domain",
				"ip4",
				"ip6",
				"entity",
				"url",
				"tld",
				"registrar",
				"json",
			];
			for (const type of types) {
				const params = new URLSearchParams(`?query=test&type=${type}`);
				const result = deserializeUrlToQuery(params);
				expect(result?.type).toBe(type);
			}
		});
	});

	describe("buildShareableUrl", () => {
		it("should build complete shareable URL without type", () => {
			const result = buildShareableUrl("https://rdap.xevion.dev", "example.com");
			expect(result).toBe("https://rdap.xevion.dev?query=example.com");
		});

		it("should build complete shareable URL with type", () => {
			const result = buildShareableUrl("https://rdap.xevion.dev", "example.com", "domain");
			expect(result).toBe("https://rdap.xevion.dev?query=example.com&type=domain");
		});

		it("should handle base URL with trailing slash", () => {
			const result = buildShareableUrl("https://rdap.xevion.dev/", "8.8.8.8", "ip4");
			expect(result).toBe("https://rdap.xevion.dev/?query=8.8.8.8&type=ip4");
		});
	});
});
