import { describe, it, expect, vi } from "vitest";
import type { SyntheticEvent } from "react";
import { cn, onPromise, preventDefault, truthy, truncated } from "@/lib/misc";

describe("truncated", () => {
	it.each([
		["short input untouched", "hello", 10, "hello"],
		["exact length untouched", "hello", 5, "hello"],
		["one over truncates", "hello!", 5, "he..."],
		["long input", "the quick brown fox", 10, "the qui..."],
		["room for one character", "hello", 4, "h..."],
	])("should handle %s", (_name, input, maxLength, expected) => {
		expect(truncated(input, maxLength)).toBe(expected);
	});

	it.each([5, 10, 15, 40])("should never exceed maxLength of %d", (maxLength) => {
		const input = "a".repeat(200);
		expect(truncated(input, maxLength).length).toBeLessThanOrEqual(maxLength);
	});

	it.each([
		["zero", 0],
		["negative", -5],
	])("should return an empty string for a %s maxLength", (_name, maxLength) => {
		expect(truncated("hello", maxLength)).toBe("");
	});

	it("should respect a custom ellipsis", () => {
		expect(truncated("hello world", 8, "…")).toBe("hello w…");
	});

	it("should handle an empty input", () => {
		expect(truncated("", 10)).toBe("");
	});
});

describe("truthy", () => {
	it.each(["true", "TRUE", "True", "tRuE", "1"])("should accept %s", (value) => {
		expect(truthy(value)).toBe(true);
	});

	it.each(["false", "FALSE", "0", "yes", "on", "", "2", "truthy", " true"])(
		"should reject %s",
		(value) => {
			expect(truthy(value)).toBe(false);
		}
	);

	it.each([
		["null", null],
		["undefined", undefined],
	])("should reject %s", (_name, value) => {
		expect(truthy(value)).toBe(false);
	});
});

describe("onPromise", () => {
	const event = {} as SyntheticEvent;

	it("should invoke the wrapped handler with the event", async () => {
		const handler = vi.fn().mockResolvedValue(undefined);

		onPromise(handler)(event);
		await vi.waitFor(() => expect(handler).toHaveBeenCalledWith(event));
	});

	it("should swallow a rejection rather than surfacing an unhandled rejection", async () => {
		const logged = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const handler = vi.fn().mockRejectedValue(new Error("boom"));

		expect(() => onPromise(handler)(event)).not.toThrow();
		await vi.waitFor(() =>
			expect(logged).toHaveBeenCalledWith("Unexpected error", expect.any(Error))
		);

		logged.mockRestore();
	});
});

describe("preventDefault", () => {
	it("should call preventDefault on the event", () => {
		const event = { preventDefault: vi.fn() } as unknown as Event;

		preventDefault(event);

		expect(event.preventDefault).toHaveBeenCalled();
	});
});

describe("cn", () => {
	it("should join class names", () => {
		expect(cn("a", "b")).toBe("a b");
	});

	it("should drop falsy values", () => {
		expect(cn("a", false, null, undefined, "b")).toBe("a b");
	});

	it("should let a later tailwind class win over an earlier conflicting one", () => {
		expect(cn("p-2", "p-4")).toBe("p-4");
	});

	it("should keep non-conflicting tailwind classes", () => {
		expect(cn("p-2", "m-4")).toBe("p-2 m-4");
	});
});
