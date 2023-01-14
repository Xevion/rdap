export type Uri = 'ip' | 'autnum' | 'entity' | 'url' | 'tld' | 'registrar' | 'json' | 'domain';
export type ExtendedUri = Omit<Uri, 'ip'> | 'ip4' | 'ip6';
export type RdapStatusType = "validated" | "renew prohibited" | "update prohibited" | "transfer prohibited"
    | "delete prohibited" | "proxy" | "private" | "removed" | "obscured" | "associated" | "active" | "inactive"
    | "locked" | "pending create" | "pending renew" | "pending transfer" | "pending update" | "pending delete"
    | "add period" | "auto renew period" | "client delete prohibited" | "client hold" | "client renew prohibited"
    | "client transfer prohibited" | "client update prohibited" | "pending restore" | "redemption period"
    | "renew period" | "server delete prohibited" | "server renew prohibited" | "server transfer prohibited"
    | "server update prohibited" | "server hold" | "transfer period";