import type {z} from "zod";
import type {
    AutonomousNumberSchema,
    DomainSchema,
    EntitySchema,
    EventSchema,
    IpNetworkSchema,
    LinkSchema,
    NameserverSchema,
    ObjectTypeEnum,
    RegisterSchema,
    StatusEnum
} from "@/schema";

export type ObjectType = z.infer<typeof ObjectTypeEnum>
export type RegistryType = Exclude<ObjectType, 'ip'> | 'ip4' | 'ip6';

export type RdapStatusType = z.infer<typeof StatusEnum>;
export type Link = z.infer<typeof LinkSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type Nameserver = z.infer<typeof NameserverSchema>;
export type Event = z.infer<typeof EventSchema>;
export type IpNetwork = z.infer<typeof IpNetworkSchema>;
export type AutonomousNumber = z.infer<typeof AutonomousNumberSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type Domain = z.infer<typeof DomainSchema>;
