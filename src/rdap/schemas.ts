import { z } from "zod";

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
	"administrative",
	"reserved",
]);

export const LinkSchema = z.object({
	value: z.string().optional(), // de-facto optional
	rel: z.string().optional(), // de-facto optional
	href: z.string(),
	hrefLang: z.array(z.string()).optional(),
	title: z.string().optional(),
	media: z.string().optional(),
	type: z.string().optional(),
});

export const EventSchema = z.object({
	eventAction: z.string(),
	eventActor: z.string().optional(),
	eventDate: z.string(),
});

export const NoticeSchema = z.object({
	description: z.string().array(), // de jure required
	title: z.string().optional(),
	type: z.string().optional(),
	links: z.array(LinkSchema).optional(),
});

export const RemarkSchema = z.object({
	description: z.string().array(), // de jure required
	title: z.string().optional(),
	type: z.string().optional(),
	links: z.array(LinkSchema).optional(),
});

// vCard 4.0 in jCard format (RFC 7095)
// Simplified schema - full vCard is complex, so we use a loose schema
// Format: ["vcard", [properties...]]
export const VCardArraySchema = z.array(z.any());

// JSContact (RFC 9553) - JSON representation of contact data
// More structured than vCard, used as alternative in RDAP responses

export const JSContactNameComponentSchema = z.object({
	kind: z
		.enum([
			"title",
			"given",
			"given2",
			"surname",
			"surname2",
			"credential",
			"generation",
			"separator",
		])
		.optional(),
	value: z.string(),
});

export const JSContactNameSchema = z.object({
	full: z.string().optional(),
	components: z.array(JSContactNameComponentSchema).optional(),
	isOrdered: z.boolean().optional(),
	sortAs: z.record(z.string(), z.string()).optional(),
});

export const JSContactEmailSchema = z.object({
	address: z.string(), // addr-spec format per RFC5322
	contexts: z.record(z.string(), z.boolean()).optional(),
	pref: z.number().optional(),
	label: z.string().optional(),
});

export const JSContactPhoneSchema = z.object({
	number: z.string(), // URI or free text
	features: z.record(z.string(), z.boolean()).optional(), // mobile, voice, text, video, etc.
	contexts: z.record(z.string(), z.boolean()).optional(),
	pref: z.number().optional(),
	label: z.string().optional(),
});

export const JSContactAddressComponentSchema = z.object({
	kind: z.string().optional(),
	value: z.string(),
});

export const JSContactAddressSchema = z.object({
	components: z.array(JSContactAddressComponentSchema).optional(),
	full: z.string().optional(),
	countryCode: z.string().optional(),
	coordinates: z.string().optional(),
	timeZone: z.string().optional(),
	contexts: z.record(z.string(), z.boolean()).optional(),
	pref: z.number().optional(),
});

export const JSContactOrganizationSchema = z.object({
	name: z.string().optional(),
	units: z.array(z.object({ name: z.string() })).optional(),
	sortAs: z.record(z.string(), z.string()).optional(),
	contexts: z.record(z.string(), z.boolean()).optional(),
});

export const JSContactTitleSchema = z.object({
	name: z.string(),
	kind: z.enum(["title", "role"]).optional(),
	organizationId: z.string().optional(),
});

export const JSContactOnlineServiceSchema = z.object({
	service: z.string().optional(),
	uri: z.string().optional(),
	user: z.string().optional(),
	contexts: z.record(z.string(), z.boolean()).optional(),
	pref: z.number().optional(),
	label: z.string().optional(),
});

export const JSContactLinkSchema = z.object({
	uri: z.string(),
	contexts: z.record(z.string(), z.boolean()).optional(),
	pref: z.number().optional(),
	label: z.string().optional(),
});

// Main JSCard object (RFC 9553)
export const JSCardSchema = z
	.object({
		"@type": z.literal("Card"),
		version: z.string(), // Should be "1.0"
		uid: z.string(), // Unique identifier
		created: z.string().optional(), // UTCDateTime
		updated: z.string().optional(), // UTCDateTime
		kind: z
			.enum(["individual", "group", "org", "location", "device", "application"])
			.optional(),
		language: z.string().optional(),
		name: JSContactNameSchema.optional(),
		organizations: z.record(z.string(), JSContactOrganizationSchema).optional(),
		titles: z.record(z.string(), JSContactTitleSchema).optional(),
		emails: z.record(z.string(), JSContactEmailSchema).optional(),
		phones: z.record(z.string(), JSContactPhoneSchema).optional(),
		onlineServices: z.record(z.string(), JSContactOnlineServiceSchema).optional(),
		addresses: z.record(z.string(), JSContactAddressSchema).optional(),
		links: z.record(z.string(), JSContactLinkSchema).optional(),
		// Allow additional properties for extensibility
		// JSContact spec allows vendor-specific extensions
	})
	.passthrough();

export const IPAddressesSchema = z.object({
	v4: z.array(z.string()).optional(),
	v6: z.array(z.string()).optional(),
});

export const DSDataSchema = z.object({
	keyTag: z.number(),
	algorithm: z.number(),
	digest: z.string(),
	digestType: z.number(),
});

export const KeyDataSchema = z.object({
	flags: z.number(),
	protocol: z.number(),
	publicKey: z.string(),
	algorithm: z.number(),
});

export const SecureDNSSchema = z.object({
	zoneSigned: z.boolean().optional(),
	delegationSigned: z.boolean().optional(),
	maxSigLife: z.number().optional(),
	dsData: z.array(DSDataSchema).optional(),
	keyData: z.array(KeyDataSchema).optional(),
});

export const VariantSchema = z.object({
	relation: z.array(z.string()).optional(),
	idnTable: z.string().optional(),
	variantNames: z
		.array(
			z.object({
				ldhName: z.string(),
				unicodeName: z.string().optional(),
			})
		)
		.optional(),
});

export const NameserverSchema = z.object({
	objectClassName: z.literal("nameserver"),
	ldhName: z.string(),
	unicodeName: z.string().optional(),
	handle: z.string().optional(),
	ipAddresses: IPAddressesSchema.optional(),
	status: z.array(StatusEnum).optional(),
	events: z.array(EventSchema).optional(),
	links: z.array(LinkSchema).optional(),
	remarks: z.array(RemarkSchema).optional(),
	port43: z.string().optional(),
	entities: z.lazy(() => z.array(EntitySchema)).optional(),
});

export const IpNetworkSchema = z.object({
	objectClassName: z.literal("ip network"),
	handle: z.string(),
	startAddress: z.string(),
	endAddress: z.string(),
	ipVersion: z.enum(["v4", "v6"]),
	name: z.string().optional(),
	type: z.string().optional(),
	country: z.string().optional(),
	parentHandle: z.string().optional(),
	status: z.array(StatusEnum).optional(),
	remarks: z.array(RemarkSchema).optional(),
	links: z.array(LinkSchema).optional(),
	port43: z.string().optional(),
	events: z.array(EventSchema).optional(),
	// Required for circular reference
	get entities() {
		return z.array(EntitySchema).optional();
	},
});

// Forward declaration for circular Entity reference
const BaseEntitySchema = z.object({
	objectClassName: z.literal("entity"),
	handle: z.string().optional(),
	vcardArray: VCardArraySchema.optional(),
	jscard: JSCardSchema.optional(),
	roles: z.array(z.string()).optional(),
	publicIds: z
		.array(
			z.object({
				type: z.string(),
				identifier: z.string(),
			})
		)
		.optional(),
	status: z.array(StatusEnum).optional(),
	events: z.array(EventSchema).optional(),
	links: z.array(LinkSchema).optional(),
	remarks: z.array(RemarkSchema).optional(),
	port43: z.string().optional(),
});

export const AutonomousNumberSchema = z.object({
	objectClassName: z.literal("autnum"),
	handle: z.string(),
	startAutnum: z.number().positive(), // TODO: 32bit
	endAutnum: z.number().positive(), // TODO: 32bit
	name: z.string(),
	type: z.string(),
	status: z.array(StatusEnum),
	country: z.string().length(2),
	events: z.array(EventSchema),
	get entities() {
		return z.array(EntitySchema).optional();
	},
	links: z.array(LinkSchema).optional(),
	remarks: z.array(RemarkSchema).optional(),
	port43: z.string().optional(),
});

// Full Entity schema with circular references
export const EntitySchema = BaseEntitySchema.extend({
	networks: z.lazy(() => z.array(IpNetworkSchema)).optional(),
	autnums: z.lazy(() => z.array(AutonomousNumberSchema)).optional(),
	asEventActor: z.array(EventSchema).optional(),
	get entities() {
		return z.array(EntitySchema).optional();
	},
});

export const DomainSchema = z.object({
	objectClassName: z.literal("domain"),
	handle: z.string().optional(),
	ldhName: z.string(),
	unicodeName: z.string().optional(),
	variants: z.array(VariantSchema).optional(),
	links: z.array(LinkSchema).optional(),
	status: z.array(StatusEnum).optional(),
	entities: z.lazy(() => z.array(EntitySchema)).optional(),
	events: z.array(EventSchema).optional(),
	secureDNS: SecureDNSSchema.optional(),
	nameservers: z.array(NameserverSchema).optional(),
	rdapConformance: z.string().array().optional(),
	notices: z.array(NoticeSchema).optional(),
	remarks: z.array(RemarkSchema).optional(),
	port43: z.string().optional(),
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
export type Remark = z.infer<typeof RemarkSchema>;
export type VCardArray = z.infer<typeof VCardArraySchema>;
export type JSCard = z.infer<typeof JSCardSchema>;
export type JSContactName = z.infer<typeof JSContactNameSchema>;
export type JSContactEmail = z.infer<typeof JSContactEmailSchema>;
export type JSContactPhone = z.infer<typeof JSContactPhoneSchema>;
export type JSContactAddress = z.infer<typeof JSContactAddressSchema>;
export type JSContactOrganization = z.infer<typeof JSContactOrganizationSchema>;
export type JSContactTitle = z.infer<typeof JSContactTitleSchema>;
export type IPAddresses = z.infer<typeof IPAddressesSchema>;
export type DSData = z.infer<typeof DSDataSchema>;
export type KeyData = z.infer<typeof KeyDataSchema>;
export type SecureDNS = z.infer<typeof SecureDNSSchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type IpNetwork = z.infer<typeof IpNetworkSchema>;
export type AutonomousNumber = z.infer<typeof AutonomousNumberSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type Domain = z.infer<typeof DomainSchema>;

export type SubmitProps = {
	target: string;
	requestJSContact: boolean;
	followReferral: boolean;
};
