import { describe, it, expect } from "vitest";
import { ipv4InCIDR, ipv6InCIDR } from "./helpers";

describe("ipv4InCIDR", () => {
	describe("basic matching", () => {
		it("should match IP in /8 network", () => {
			expect(ipv4InCIDR("8.8.8.8", "8.0.0.0/8")).toBe(true);
			expect(ipv4InCIDR("8.255.255.255", "8.0.0.0/8")).toBe(true);
			expect(ipv4InCIDR("8.0.0.0", "8.0.0.0/8")).toBe(true);
		});

		it("should not match IP outside /8 network", () => {
			expect(ipv4InCIDR("9.0.0.0", "8.0.0.0/8")).toBe(false);
			expect(ipv4InCIDR("7.255.255.255", "8.0.0.0/8")).toBe(false);
		});

		it("should match IP in /16 network", () => {
			expect(ipv4InCIDR("192.168.1.1", "192.168.0.0/16")).toBe(true);
			expect(ipv4InCIDR("192.168.255.255", "192.168.0.0/16")).toBe(true);
			expect(ipv4InCIDR("192.168.0.0", "192.168.0.0/16")).toBe(true);
		});

		it("should not match IP outside /16 network", () => {
			expect(ipv4InCIDR("192.169.1.1", "192.168.0.0/16")).toBe(false);
			expect(ipv4InCIDR("192.167.1.1", "192.168.0.0/16")).toBe(false);
		});

		it("should match IP in /24 network", () => {
			expect(ipv4InCIDR("192.168.1.1", "192.168.1.0/24")).toBe(true);
			expect(ipv4InCIDR("192.168.1.255", "192.168.1.0/24")).toBe(true);
			expect(ipv4InCIDR("192.168.1.0", "192.168.1.0/24")).toBe(true);
		});

		it("should not match IP outside /24 network", () => {
			expect(ipv4InCIDR("192.168.2.1", "192.168.1.0/24")).toBe(false);
			expect(ipv4InCIDR("192.168.0.255", "192.168.1.0/24")).toBe(false);
		});

		it("should match IP in /32 network (single host)", () => {
			expect(ipv4InCIDR("192.168.1.1", "192.168.1.1/32")).toBe(true);
		});

		it("should not match different IP in /32 network", () => {
			expect(ipv4InCIDR("192.168.1.2", "192.168.1.1/32")).toBe(false);
		});
	});

	describe("real-world RDAP bootstrap ranges", () => {
		// ARIN ranges (from IANA bootstrap data)
		it("should match Google DNS (8.8.8.8) in ARIN range", () => {
			expect(ipv4InCIDR("8.8.8.8", "8.0.0.0/8")).toBe(true);
		});

		// APNIC ranges
		it("should match Cloudflare DNS (1.1.1.1) in APNIC range", () => {
			expect(ipv4InCIDR("1.1.1.1", "1.0.0.0/8")).toBe(true);
		});

		// Private ranges
		it("should match private IPs in their ranges", () => {
			expect(ipv4InCIDR("10.0.0.1", "10.0.0.0/8")).toBe(true);
			expect(ipv4InCIDR("172.16.0.1", "172.16.0.0/12")).toBe(true);
			expect(ipv4InCIDR("192.168.0.1", "192.168.0.0/16")).toBe(true);
		});
	});

	describe("edge cases", () => {
		it("should handle /0 (all IPs)", () => {
			expect(ipv4InCIDR("0.0.0.0", "0.0.0.0/0")).toBe(true);
			expect(ipv4InCIDR("255.255.255.255", "0.0.0.0/0")).toBe(true);
			expect(ipv4InCIDR("192.168.1.1", "0.0.0.0/0")).toBe(true);
		});

		it("should handle invalid CIDR notation", () => {
			expect(ipv4InCIDR("192.168.1.1", "invalid")).toBe(false);
			expect(ipv4InCIDR("192.168.1.1", "192.168.1.0/-1")).toBe(false);
			expect(ipv4InCIDR("192.168.1.1", "192.168.1.0/33")).toBe(false);
		});

		it("should handle malformed IPs", () => {
			expect(ipv4InCIDR("invalid", "192.168.1.0/24")).toBe(false);
		});

		it("should handle partial IPs (wrong number of octets)", () => {
			expect(ipv4InCIDR("8.8", "8.0.0.0/8")).toBe(false);
			expect(ipv4InCIDR("192.168.1", "192.168.1.0/24")).toBe(false);
			expect(ipv4InCIDR("192.168.1.1.1", "192.168.1.0/24")).toBe(false);
		});
	});
});

describe("ipv6InCIDR", () => {
	describe("basic matching", () => {
		it("should match IPv6 in /32 network", () => {
			expect(ipv6InCIDR("2001:db8::", "2001:db8::/32")).toBe(true);
			expect(ipv6InCIDR("2001:db8:1234::", "2001:db8::/32")).toBe(true);
			expect(ipv6InCIDR("2001:db8:ffff:ffff:ffff:ffff:ffff:ffff", "2001:db8::/32")).toBe(
				true
			);
		});

		it("should not match IPv6 outside /32 network", () => {
			expect(ipv6InCIDR("2001:db9::", "2001:db8::/32")).toBe(false);
			expect(ipv6InCIDR("2001:db7::", "2001:db8::/32")).toBe(false);
		});

		it("should match IPv6 in /64 network", () => {
			expect(ipv6InCIDR("2001:db8:1234:5678::", "2001:db8:1234:5678::/64")).toBe(true);
			expect(ipv6InCIDR("2001:db8:1234:5678:abcd::", "2001:db8:1234:5678::/64")).toBe(true);
			expect(
				ipv6InCIDR("2001:db8:1234:5678:ffff:ffff:ffff:ffff", "2001:db8:1234:5678::/64")
			).toBe(true);
		});

		it("should not match IPv6 outside /64 network", () => {
			expect(ipv6InCIDR("2001:db8:1234:5679::", "2001:db8:1234:5678::/64")).toBe(false);
		});

		it("should match IPv6 in /128 network (single host)", () => {
			expect(ipv6InCIDR("2001:db8::1", "2001:db8::1/128")).toBe(true);
		});

		it("should not match different IPv6 in /128 network", () => {
			expect(ipv6InCIDR("2001:db8::2", "2001:db8::1/128")).toBe(false);
		});
	});

	describe("real-world RDAP bootstrap ranges", () => {
		it("should match Google IPv6 DNS in ARIN range", () => {
			// Google DNS: 2001:4860:4860::8888
			expect(ipv6InCIDR("2001:4860:4860::8888", "2001:4860::/32")).toBe(true);
		});

		it("should match Cloudflare IPv6 DNS in APNIC range", () => {
			// Cloudflare DNS: 2606:4700:4700::1111
			expect(ipv6InCIDR("2606:4700:4700::1111", "2606:4700::/32")).toBe(true);
		});
	});

	describe("IPv6 shorthand notation", () => {
		it("should handle :: notation correctly", () => {
			expect(ipv6InCIDR("2001:db8::1", "2001:db8::/32")).toBe(true);
			expect(ipv6InCIDR("::1", "::1/128")).toBe(true);
			expect(ipv6InCIDR("::", "::/128")).toBe(true);
		});

		it("should handle expanded vs compressed notation", () => {
			expect(ipv6InCIDR("2001:0db8:0000:0000:0000:0000:0000:0001", "2001:db8::/32")).toBe(
				true
			);
			expect(ipv6InCIDR("2001:db8::1", "2001:0db8:0000:0000:0000:0000:0000:0000/32")).toBe(
				true
			);
		});
	});

	describe("edge cases", () => {
		it("should handle invalid CIDR notation", () => {
			expect(ipv6InCIDR("2001:db8::1", "invalid")).toBe(false);
			expect(ipv6InCIDR("2001:db8::1", "2001:db8::/-1")).toBe(false);
			expect(ipv6InCIDR("2001:db8::1", "2001:db8::/129")).toBe(false);
		});

		it("should handle malformed IPv6", () => {
			expect(ipv6InCIDR("invalid", "2001:db8::/32")).toBe(false);
			expect(ipv6InCIDR("zzzz::1", "2001:db8::/32")).toBe(false);
			expect(ipv6InCIDR("2001:xyz::1", "2001:db8::/32")).toBe(false);
		});
	});
});
