import { describe, it, expect, vi } from "vitest";
import { getType } from "@/rdap/utils";
import type { Register } from "@/rdap/schemas";

// Mock registry getter (matches real IANA structure: [email, tags, urls])
const mockRegistry: Register = {
	description: "Test registry",
	publication: "2024-01-01",
	version: "1.0",
	services: [
		[
			["test@example.com"], // email
			["RIPE", "APNIC"], // tags
			["https://rdap.example.com/"], // urls
		],
	],
};

const mockGetRegistry = vi.fn(() => Promise.resolve(mockRegistry));

describe("getType - IP address detection", () => {
	describe("IPv4 detection", () => {
		it("should detect standard IPv4 addresses", async () => {
			const result = await getType("192.168.1.1", mockGetRegistry);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe("ip4");
			}
		});

		it("should detect IPv4 with CIDR notation", async () => {
			const result = await getType("192.168.1.0/24", mockGetRegistry);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe("ip4");
			}
		});

		it("should detect various IPv4 addresses", async () => {
			const ips = [
				"8.8.8.8",
				"1.1.1.1",
				"10.0.0.1",
				"172.16.0.1",
				"255.255.255.255",
				"0.0.0.0",
			];

			for (const ip of ips) {
				const result = await getType(ip, mockGetRegistry);
				expect(result.isOk).toBe(true);
				if (result.isOk) {
					expect(result.value).toBe("ip4");
				}
			}
		});

		it("should detect IPv4 with various CIDR prefixes", async () => {
			const cidrs = [
				"192.168.1.0/8",
				"10.0.0.0/16",
				"172.16.0.0/12",
				"8.8.8.0/24",
				"1.1.1.1/32",
			];

			for (const cidr of cidrs) {
				const result = await getType(cidr, mockGetRegistry);
				expect(result.isOk).toBe(true);
				if (result.isOk) {
					expect(result.value).toBe("ip4");
				}
			}
		});
	});

	describe("IPv6 detection", () => {
		it("should detect standard IPv6 addresses", async () => {
			const result = await getType("2001:db8::1", mockGetRegistry);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe("ip6");
			}
		});

		it("should detect IPv6 with CIDR notation", async () => {
			const result = await getType("2001:db8::/32", mockGetRegistry);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe("ip6");
			}
		});

		it("should detect various IPv6 addresses", async () => {
			const ips = [
				"2001:4860:4860::8888", // Google DNS
				"2606:4700:4700::1111", // Cloudflare DNS
				"::1", // Localhost
				"::", // All zeros
				"fe80::1", // Link-local
				"2001:db8:85a3::8a2e:370:7334", // Full notation
			];

			for (const ip of ips) {
				const result = await getType(ip, mockGetRegistry);
				expect(result.isOk).toBe(true);
				if (result.isOk) {
					expect(result.value).toBe("ip6");
				}
			}
		});

		it("should detect IPv6 with various CIDR prefixes", async () => {
			const cidrs = ["2001:db8::/32", "2001:4860::/32", "fe80::/10", "::1/128"];

			for (const cidr of cidrs) {
				const result = await getType(cidr, mockGetRegistry);
				expect(result.isOk).toBe(true);
				if (result.isOk) {
					expect(result.value).toBe("ip6");
				}
			}
		});
	});
});

describe("getType - Domain detection", () => {
	it("should detect standard domains", async () => {
		const result = await getType("example.com", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("domain");
		}
	});

	it("should detect various domain formats", async () => {
		const domains = [
			"google.com",
			"www.example.com",
			"sub.domain.example.com",
			"test-domain.com",
			"example123.org",
			"a.b.c.d.example.net",
		];

		for (const domain of domains) {
			const result = await getType(domain, mockGetRegistry);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe("domain");
			}
		}
	});
});

describe("getType - ASN detection", () => {
	it("should detect standard ASN format", async () => {
		const result = await getType("AS12345", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("autnum");
		}
	});

	it("should detect various ASN formats", async () => {
		const asns = [
			"AS1",
			"AS13335", // Cloudflare
			"AS15169", // Google
			"AS8075", // Microsoft
			"AS16509", // Amazon
			"AS999999",
		];

		for (const asn of asns) {
			const result = await getType(asn, mockGetRegistry);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe("autnum");
			}
		}
	});
});

describe("getType - TLD detection", () => {
	it("should detect TLD format", async () => {
		const result = await getType(".com", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("tld");
		}
	});

	it("should detect various TLDs", async () => {
		const tlds = [".com", ".org", ".net", ".dev", ".io", ".ai", ".co"];

		for (const tld of tlds) {
			const result = await getType(tld, mockGetRegistry);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe("tld");
			}
		}
	});
});

describe("getType - URL detection", () => {
	it("should detect HTTP URLs", async () => {
		const result = await getType("http://example.com", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("url");
		}
	});

	it("should detect HTTPS URLs", async () => {
		const result = await getType("https://example.com", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("url");
		}
	});

	it("should detect RDAP URLs", async () => {
		const urls = [
			"https://rdap.arin.net/registry/ip/8.8.8.8",
			"http://rdap.apnic.net/ip/1.1.1.1",
			"https://rdap.org/domain/example.com",
		];

		for (const url of urls) {
			const result = await getType(url, mockGetRegistry);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe("url");
			}
		}
	});
});

describe("getType - JSON detection", () => {
	it("should detect JSON objects", async () => {
		const result = await getType('{"objectClassName":"domain"}', mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("json");
		}
	});

	it("should detect various JSON formats", async () => {
		const jsons = [
			"{}",
			'{"key": "value"}',
			'{"objectClassName":"ip network"}',
			'{"handle":"TEST"}',
		];

		for (const json of jsons) {
			const result = await getType(json, mockGetRegistry);
			expect(result.isOk).toBe(true);
			if (result.isOk) {
				expect(result.value).toBe("json");
			}
		}
	});
});

describe("getType - Invalid inputs", () => {
	it("should return error for empty string", async () => {
		const result = await getType("", mockGetRegistry);
		expect(result.isErr).toBe(true);
	});

	it("should return error for unrecognized format", async () => {
		const result = await getType("not-a-valid-input!!@@##", mockGetRegistry);
		expect(result.isErr).toBe(true);
	});

	describe("Invalid IPv4 addresses", () => {
		it("should return error for IPv4 with octet > 255", async () => {
			const result = await getType("256.1.1.1", mockGetRegistry);
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toContain("Invalid IPv4 address");
				expect(result.error.message).toContain("octet");
			}
		});

		it("should return error for IPv4 with octet 999", async () => {
			const result = await getType("192.999.1.1", mockGetRegistry);
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toContain("Invalid IPv4 address");
			}
		});

		it("should return error for IPv4 with invalid CIDR prefix", async () => {
			const result = await getType("192.168.1.1/33", mockGetRegistry);
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toContain("CIDR prefix");
			}
		});

		it("should return error for IPv4 with negative CIDR", async () => {
			const result = await getType("192.168.1.1/-1", mockGetRegistry);
			expect(result.isErr).toBe(true);
		});
	});

	describe("Invalid IPv6 addresses", () => {
		it("should return error for IPv6 with multiple ::", async () => {
			const result = await getType("2001::db8::1", mockGetRegistry);
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toContain("::");
			}
		});

		it("should return error for IPv6 with invalid CIDR prefix", async () => {
			const result = await getType("2001:db8::1/129", mockGetRegistry);
			expect(result.isErr).toBe(true);
			if (result.isErr) {
				expect(result.error.message).toContain("CIDR prefix");
			}
		});

		it("should not match completely invalid hex strings as IPv6", async () => {
			// "gggg" doesn't match the basic IPv6 pattern, so it won't be detected as IPv6
			const result = await getType("gggg::1", mockGetRegistry);
			expect(result.isErr).toBe(true);
			// Won't have IPv6-specific error since it didn't match the pattern
			if (result.isErr) {
				expect(result.error.message).toContain("No patterns matched");
			}
		});
	});
});

describe("getType - Type detection priority", () => {
	it("should detect URL before domain", async () => {
		const result = await getType("https://example.com", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("url");
		}
	});

	it("should detect JSON before domain", async () => {
		const result = await getType('{"key":"value"}', mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("json");
		}
	});

	it("should detect TLD before domain", async () => {
		const result = await getType(".com", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("tld");
		}
	});

	it("should detect IP before domain", async () => {
		const result = await getType("8.8.8.8", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("ip4");
		}
	});
});

describe("getType - Case sensitivity", () => {
	it("should detect uppercase domains", async () => {
		const result = await getType("GOOGLE.COM", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("domain");
		}
	});

	it("should detect mixed case domains", async () => {
		const result = await getType("GoOgLe.CoM", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("domain");
		}
	});

	it("should detect lowercase ASN", async () => {
		const result = await getType("as12345", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("autnum");
		}
	});

	it("should detect uppercase ASN", async () => {
		const result = await getType("AS12345", mockGetRegistry);
		expect(result.isOk).toBe(true);
		if (result.isOk) {
			expect(result.value).toBe("autnum");
		}
	});
});
