import type { z } from "zod";
import type {
	AutonomousNumberSchema,
	DomainSchema,
	EntitySchema,
	EventSchema,
	IpNetworkSchema,
	LinkSchema,
	NameserverSchema,
	TargetTypeEnum,
	RegisterSchema,
	StatusEnum,
	RootRegistryEnum,
} from "@/schema";

// All precise target types that can be placed in the search bar.
export type TargetType = z.infer<typeof TargetTypeEnum>;

// Target types that can be selected by the user; IPv4 and IPv6 are combined into a single type for simplicity (IP/CIDR)
export type SimplifiedTargetType = Exclude<TargetType, "ip4" | "ip6"> | "ip";

// Root registry types that associate with a bootstrap file provided by the RDAP registry.
export type RootRegistryType = z.infer<typeof RootRegistryEnum>;

export type RdapStatusType = z.infer<typeof StatusEnum>;
export type Link = z.infer<typeof LinkSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type Nameserver = z.infer<typeof NameserverSchema>;
export type Event = z.infer<typeof EventSchema>;
export type IpNetwork = z.infer<typeof IpNetworkSchema>;
export type AutonomousNumber = z.infer<typeof AutonomousNumberSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type Domain = z.infer<typeof DomainSchema>;

export type SubmitProps = {
	target: string;
	requestJSContact: boolean;
	followReferral: boolean;
};
