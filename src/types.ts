import type {z} from "zod";
import type {ObjectTypeEnum} from "@/responses";
import type {StatusEnum} from "@/responses";

export type ObjectType = z.infer<typeof ObjectTypeEnum>
export type ExtendedUri = Omit<ObjectType, 'ip'> | 'ip4' | 'ip6';

export type RdapStatusType = z.infer<typeof StatusEnum>;