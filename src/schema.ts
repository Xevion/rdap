import {z} from "zod";

export const ObjectTypeEnum = z.enum(['ip', 'autnum', 'entity', 'url', 'tld', 'registrar', 'json', 'domain'])
export const StatusEnum = z.enum(["validated", "renew prohibited", "update prohibited", "transfer prohibited", "delete prohibited", "proxy", "private", "removed", "obscured", "associated", "active", "inactive", "locked", "pending create", "pending renew", "pending transfer", "pending update", "pending delete", "add period", "auto renew period", "client delete prohibited", "client hold", "client renew prohibited", "client transfer prohibited", "client update prohibited", "pending restore", "redemption period", "renew period", "server delete prohibited", "server renew prohibited", "server transfer prohibited", "server update prohibited", "server hold", "transfer period"])

export const LinkSchema = z.object({
    value: z.string().optional(),
    rel: z.string(),
    href: z.string(),
    type: z.string()
})


export const EntitySchema = z.object({
    objectClassName: z.literal('entity'),
    handle: z.string(),
    roles: z.array(z.string()),
    publicIds: z.array(z.object({
        type: z.string(),
        identifier: z.string(),
    })).optional()
})

export const NameserverSchema = z.object({
    objectClassName: z.literal('nameserver'),
    ldhName: z.string()
})

export const EventSchema = z.object({
    eventAction: z.string(),
    eventActor: z.string().optional(),
    eventDate: z.string()
})

export const NoticeSchema = z.object({
    title: z.string().optional(),
    description: z.string().array(),
    links: z.array(z.object({
        href: z.string(),
        type: z.string()
    })).optional()
})
export type Notice = z.infer<typeof NoticeSchema>;

export const IpNetworkSchema = z.object({
    objectClassName: z.literal('ip network'),
    handle: z.string(),
    startAddress: z.string(),
    endAddress: z.string(),
    ipVersion: z.enum(['v4', 'v6']),
    name: z.string(),
    type: z.string(),
    country: z.string(),
    parentHandle: z.string(),
    status: z.string().array(),
    entities: z.array(EntitySchema),
    remarks: z.any(),
    links: z.any(),
    port43: z.any().optional(),
    events: z.array(EventSchema)
})


export const AutonomousNumberSchema = z.object({
    objectClassName: z.literal('autnum'),
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
    links: z.array(LinkSchema)
})

export const DomainSchema = z.object({
    objectClassName: z.literal('domain'),
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
})


const RegistrarSchema = z.tuple([
    z.array(z.string()).min(1),
    z.array(z.string()).min(1)
]).or(z.tuple([
    z.array(z.string()).min(1),
    z.array(z.string()).min(1),
    z.array(z.string()).min(1)
]))

export const RegisterSchema = z.object({
    description: z.string(),
    publication: z.string(),
    services: z.array(RegistrarSchema),
    version: z.string()
});
