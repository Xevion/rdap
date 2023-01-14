import {z} from "zod";

export const ObjectTypeEnum = z.enum(['ip', 'autnum', 'entity', 'url', 'tld', 'registrar', 'json', 'domain'])
export const StatusEnum = z.enum(["validated", "renew prohibited", "update prohibited", "transfer prohibited", "delete prohibited", "proxy", "private", "removed", "obscured", "associated", "active", "inactive", "locked", "pending create", "pending renew", "pending transfer", "pending update", "pending delete", "add period", "auto renew period", "client delete prohibited", "client hold", "client renew prohibited", "client transfer prohibited", "client update prohibited", "pending restore", "redemption period", "renew period", "server delete prohibited", "server renew prohibited", "server transfer prohibited", "server update prohibited", "server hold", "transfer period"])

export const LinkSchema = z.object({
    value: z.string(),
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
    }))
})

export const NameserverSchema = z.object({
    objectClassName: z.literal('nameserver'),
    ldhName: z.string()
})
export const EventSchema = z.object({
    eventAction: z.string(),
    eventDate: z.date()
})
export const NoticeSchema = z.object({
    title: z.string(),
    description: z.string().array(),
    links: z.array(z.object({
        href: z.string(),
        tpye: z.string()
    }))
})

export const DomainSchema = z.object({
    objectClassName: z.literal('domain'),
    handle: z.string(),
    ldhName: z.string(),
    links: z.array(LinkSchema),
    status: z.array(StatusEnum),
    entities: z.array(EntitySchema),
    events: z.array(EventSchema),
    secureDNS: z.any(), // TODO: Complete
    nameservers: z.array(NameserverSchema),
    rdapConformance: z.string().array(), // TODO: Complete
    notices: z.array(NoticeSchema),
})