import { describe, it, expect } from "vitest";
import { AutonomousNumberSchema, IpNetworkSchema } from "@/rdap/schemas";

/**
 * Shapes taken from what the five RIRs actually return. The schema previously
 * required `type` and `country` on autnum objects, which no RIR sends in full, so
 * every ASN lookup failed to parse regardless of which registry served it.
 */
const autnum = (over: Record<string, unknown>) => ({
	objectClassName: "autnum",
	handle: "AS13335",
	startAutnum: 13335,
	endAutnum: 13335,
	name: "CLOUDFLARENET",
	status: ["active"],
	events: [{ eventAction: "registration", eventDate: "2010-07-14T22:00:00Z" }],
	...over,
});

describe("AutonomousNumberSchema", () => {
	it.each([
		["ARIN, which sends neither type nor country", {}],
		["RIPE, which sends neither type nor country", {}],
		["AFRINIC, which sends neither type nor country", {}],
		["APNIC, which sends country only", { country: "AU" }],
		["LACNIC, which sends type only", { type: "DIRECT ALLOCATION" }],
		["a registry sending both", { type: "DIRECT ALLOCATION", country: "US" }],
	])("should accept a response from %s", (_name, over) => {
		const result = AutonomousNumberSchema.safeParse(autnum(over));

		expect(result.success).toBe(true);
	});

	it.each([
		["objectClassName", "objectClassName"],
		["handle", "handle"],
		["startAutnum", "startAutnum"],
		["endAutnum", "endAutnum"],
		["name", "name"],
		["status", "status"],
		["events", "events"],
	])("should still require %s", (_name, field) => {
		const payload = autnum({});
		delete (payload as Record<string, unknown>)[field];

		expect(AutonomousNumberSchema.safeParse(payload).success).toBe(false);
	});

	it("should reject a country code that is not two characters", () => {
		expect(AutonomousNumberSchema.safeParse(autnum({ country: "USA" })).success).toBe(false);
	});
});

describe("IpNetworkSchema", () => {
	const ipNetwork = (over: Record<string, unknown>) => ({
		objectClassName: "ip network",
		handle: "NET-8-8-8-0-1",
		startAddress: "8.8.8.0",
		endAddress: "8.8.8.255",
		ipVersion: "v4",
		...over,
	});

	it.each([
		["a minimal response", {}],
		["LACNIC IPv4, which omits country", { name: "GOOGLE", status: ["active"] }],
		["LACNIC IPv6, which omits status and country", { name: "LACNIC" }],
		[
			"a fully populated response",
			{ name: "GOOGLE", type: "DIRECT ALLOCATION", country: "US", status: ["active"] },
		],
	])("should accept %s", (_name, over) => {
		expect(IpNetworkSchema.safeParse(ipNetwork(over)).success).toBe(true);
	});

	it.each(["v4", "v6"])("should accept ipVersion %s", (ipVersion) => {
		expect(IpNetworkSchema.safeParse(ipNetwork({ ipVersion })).success).toBe(true);
	});

	it("should reject an unknown ipVersion", () => {
		expect(IpNetworkSchema.safeParse(ipNetwork({ ipVersion: "v5" })).success).toBe(false);
	});
});
