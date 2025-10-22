import { z } from "zod";

// ============================================================================
// Enums
// ============================================================================

export const TargetTypeEnum = z.enum([
	"autnum",
	"domain",
	"ip4",
	"ip6",
	"entity",
	"url",
	"tld",
	"registrar",
	"json",
]);

export const RootRegistryEnum = z.enum(["autnum", "domain", "ip4", "ip6", "entity"]);

export const StatusEnum = z.enum([
	"validated",
	"renew prohibited",
	"update prohibited",
	"transfer prohibited",
	"delete prohibited",
	"proxy",
	"private",
	"removed",
	"obscured",
	"associated",
	"active",
	"inactive",
	"locked",
	"pending create",
	"pending renew",
	"pending transfer",
	"pending update",
	"pending delete",
	"add period",
	"auto renew period",
	"client delete prohibited",
	"client hold",
	"client renew prohibited",
	"client transfer prohibited",
	"client update prohibited",
	"pending restore",
	"redemption period",
	"renew period",
	"server delete prohibited",
	"server renew prohibited",
	"server transfer prohibited",
	"server update prohibited",
	"server hold",
	"transfer period",
]);

// ============================================================================
// Schemas
// ============================================================================

export const LinkSchema = z.object({
	value: z.string().optional(), // de-facto optional
	rel: z.string().optional(), // de-facto optional
	href: z.string(),
	hrefLang: z.array(z.string()).optional(),
	title: z.string().optional(),
	media: z.string().optional(),
	type: z.string().optional(),
});

export const EntitySchema = z.object({
	objectClassName: z.literal("entity"),
	handle: z.string().optional(),
	roles: z.array(z.string()),
	publicIds: z
		.array(
			z.object({
				type: z.string(),
				identifier: z.string(),
			})
		)
		.optional(),
});

export const NameserverSchema = z.object({
	objectClassName: z.literal("nameserver"),
	ldhName: z.string(),
});

export const EventSchema = z.object({
	eventAction: z.string(),
	eventActor: z.string().optional(),
	eventDate: z.string(),
});

export const NoticeSchema = z.object({
	description: z.string().array(), // de jure required
	title: z.string().optional(),
	links: z.array(LinkSchema).optional(),
});

export const IpNetworkSchema = z.object({
	objectClassName: z.literal("ip network"),
	handle: z.string(),
	startAddress: z.string(),
	endAddress: z.string(),
	ipVersion: z.enum(["v4", "v6"]),
	name: z.string(),
	type: z.string(),
	country: z.string().optional(),
	parentHandle: z.string().optional(),
	status: z.string().array(),
	entities: z.array(EntitySchema).optional(),
	remarks: z.any().optional(),
	links: z.any().optional(),
	port43: z.any().optional(),
	events: z.array(EventSchema),
});

export const AutonomousNumberSchema = z.object({
	objectClassName: z.literal("autnum"),
	handle: z.string(),
	startAutnum: z.number().positive(), // TODO: 32bit
	endAutnum: z.number().positive(), // TODO: 32bit
	name: z.string(),
	type: z.string(),
	status: z.array(z.string()),
	country: z.string().length(2),
	events: z.array(EventSchema),
	entities: z.array(EntitySchema),
	roles: z.array(z.string()),
	links: z.array(LinkSchema),
});

export const DomainSchema = z.object({
	objectClassName: z.literal("domain"),
	handle: z.string(),
	ldhName: z.string(),
	unicodeName: z.string().optional(),
	links: z.array(LinkSchema).optional(),
	status: z.array(StatusEnum),
	entities: z.array(EntitySchema),
	events: z.array(EventSchema),
	secureDNS: z.any(), // TODO: Complete schema
	nameservers: z.array(NameserverSchema),
	rdapConformance: z.string().array(), // TODO: Complete
	notices: z.array(NoticeSchema),
	network: IpNetworkSchema.optional(),
});

const RegistrarSchema = z
	.tuple([z.array(z.string()).min(1), z.array(z.string()).min(1)])
	.or(
		z.tuple([
			z.array(z.string()).min(1),
			z.array(z.string()).min(1),
			z.array(z.string()).min(1),
		])
	);

export const RegisterSchema = z.object({
	description: z.string(),
	publication: z.string(),
	services: z.array(RegistrarSchema),
	version: z.string(),
});

// ============================================================================
// TypeScript Types
// ============================================================================

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
export type Notice = z.infer<typeof NoticeSchema>;
export type IpNetwork = z.infer<typeof IpNetworkSchema>;
export type AutonomousNumber = z.infer<typeof AutonomousNumberSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type Domain = z.infer<typeof DomainSchema>;

export type SubmitProps = {
	target: string;
	requestJSContact: boolean;
	followReferral: boolean;
};
