import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import { getAndParse, NotFoundError } from "@/rdap/services/api";

const Schema = z.object({ objectClassName: z.string(), handle: z.string() });

function respondWith(status: number, body: unknown = {}) {
	global.fetch = vi.fn().mockResolvedValue({
		status,
		json: () => Promise.resolve(body),
	});
}

beforeEach(() => {
	vi.restoreAllMocks();
});

describe("getAndParse", () => {
	it("should return parsed data on 200", async () => {
		respondWith(200, { objectClassName: "entity", handle: "TEST-ARIN" });

		const result = await getAndParse("https://example.test/entity/TEST-ARIN", Schema);

		expect(result.isOk).toBe(true);
		if (result.isOk) expect(result.value.handle).toBe("TEST-ARIN");
	});

	// Every status the module maps to a specific message. A registry returning one of
	// these should produce guidance, not a bare status code.
	it.each([
		[302, /available at a different location/],
		[400, /malformed or could not be processed/],
		[403, /forbidden/],
		[500, /internal server error/],
	])("should explain HTTP %d", async (status, expected) => {
		respondWith(status);

		const result = await getAndParse("https://example.test/x", Schema);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error.message).toMatch(expected);
	});

	it("should return a NotFoundError carrying the URL on 404", async () => {
		const url = "https://example.test/domain/nope.com";
		respondWith(404);

		const result = await getAndParse(url, Schema);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.error).toBeInstanceOf(NotFoundError);
			expect((result.error as NotFoundError).url).toBe(url);
		}
	});

	it.each([418, 429, 503])(
		"should fall back to a generic message for HTTP %d",
		async (status) => {
			respondWith(status);

			const result = await getAndParse("https://example.test/x", Schema);

			expect(result.isErr).toBe(true);
			if (result.isErr) expect(result.error.message).toContain(String(status));
		}
	);

	it("should report schema mismatches rather than throwing", async () => {
		respondWith(200, { objectClassName: "entity" });

		const result = await getAndParse("https://example.test/x", Schema);

		expect(result.isErr).toBe(true);
		if (result.isErr) expect(result.error.message).toContain("Could not parse the response");
	});

	it.each([
		[true, "follow"],
		[false, "manual"],
	])("should pass followRedirects=%s as redirect: %s", async (follow, expected) => {
		respondWith(200, { objectClassName: "entity", handle: "X" });

		await getAndParse("https://example.test/x", Schema, follow);

		expect(global.fetch).toHaveBeenCalledWith("https://example.test/x", {
			redirect: expected,
		});
	});
});
