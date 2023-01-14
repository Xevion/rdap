// see https://www.iana.org/assignments/rdap-json-values
import type {ExtendedUri, RdapStatusType, Uri} from "@/types";

export const rdapStatusInfo: Record<RdapStatusType, string> = {
    "validated": "Signifies that the data of the object instance has been found to be accurate. This type of status is usually found on entity object instances to note the validity of identifying contact information.",
    "renew prohibited": "Renewal or reregistration of the object instance is forbidden.",
    "update prohibited": "Updates to the object instance are forbidden.",
    "transfer prohibited": "Transfers of the registration from one registrar to another are forbidden. This type of status normally applies to DNR domain names.",
    "delete prohibited": "Deletion of the registration of the object instance is forbidden. This type of status normally applies to DNR domain names.",
    "proxy": "The registration of the object instance has been performed by a third party. This is most commonly applied to entities.",
    "private": "The information of the object instance is not designated for public consumption. This is most commonly applied to entities.",
    "removed": "Some of the information of the object instance has not been made available and has been removed. This is most commonly applied to entities.",
    "obscured": "Some of the information of the object instance has been altered for the purposes of not readily revealing the actual information of the object instance. This is most commonly applied to entities.",
    "associated": "The object instance is associated with other object instances in the registry. This is most commonly used to signify that a nameserver is associated with a domain or that an entity is associated with a network resource or domain.",
    "active": "The object instance is in use. For domain names, it signifies that the domain name is published in DNS. For network and autnum registrations it signifies that they are allocated or assigned for use in operational networks. This maps to the Extensible Provisioning Protocol (EPP) [RFC5730] 'OK' status.",
    "inactive": "The object instance is not in use. See 'active'.",
    "locked": "Changes to the object instance cannot be made, including the association of other object instances.",
    "pending create": "A request has been received for the creation of the object instance but this action is not yet complete.",
    "pending renew": "A request has been received for the renewal of the object instance but this action is not yet complete.",
    "pending transfer": "A request has been received for the transfer of the object instance but this action is not yet complete.",
    "pending update": "A request has been received for the update or modification of the object instance but this action is not yet complete.",
    "pending delete": "A request has been received for the deletion or removal of the object instance but this action is not yet complete. For domains, this might mean that the name is no longer published in DNS but has not yet been purged from the registry database.",
    "add period": "This grace period is provided after the initial registration of the object. If the object is deleted by the client during this period, the server provides a credit to the client for the cost of the registration. This maps to the Domain Registry Grace Period Mapping for the Extensible Provisioning Protocol (EPP) [RFC3915] 'addPeriod' status.",
    "auto renew period": "This grace period is provided after an object registration period expires and is extended (renewed) automatically by the server. If the object is deleted by the client during this period, the server provides a credit to the client for the cost of the auto renewal. This maps to the Domain Registry Grace Period Mapping for the Extensible Provisioning Protocol (EPP) [RFC3915] 'autoRenewPeriod' status.",
    "client delete prohibited": "The client requested that requests to delete the object MUST be rejected. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731], Extensible Provisioning Protocol (EPP) Host Mapping [RFC5732], and Extensible Provisioning Protocol (EPP) Contact Mapping [RFC5733] 'clientDeleteProhibited' status.",
    "client hold": "The client requested that the DNS delegation information MUST NOT be published for the object. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731] 'clientHold' status.",
    "client renew prohibited": "The client requested that requests to renew the object MUST be rejected. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731] 'clientRenewProhibited' status.",
    "client transfer prohibited": "The client requested that requests to transfer the object MUST be rejected. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731] and Extensible Provisioning Protocol (EPP) Contact Mapping [RFC5733] 'clientTransferProhibited' status.",
    "client update prohibited": "The client requested that requests to update the object (other than to remove this status) MUST be rejected. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731], Extensible Provisioning Protocol (EPP) Host Mapping [RFC5732], and Extensible Provisioning Protocol (EPP) Contact Mapping [RFC5733] 'clientUpdateProhibited' status.",
    "pending restore": "An object is in the process of being restored after being in the redemption period state. This maps to the Domain Registry Grace Period Mapping for the Extensible Provisioning Protocol (EPP) [RFC3915] 'pendingRestore' status.",
    "redemption period": "A delete has been received, but the object has not yet been purged because an opportunity exists to restore the object and abort the deletion process. This maps to the Domain Registry Grace Period Mapping for the Extensible Provisioning Protocol (EPP) [RFC3915] 'redemptionPeriod' status.",
    "renew period": "This grace period is provided after an object registration period is explicitly extended (renewed) by the client. If the object is deleted by the client during this period, the server provides a credit to the client for the cost of the renewal. This maps to the Domain Registry Grace Period Mapping for the Extensible Provisioning Protocol (EPP) [RFC3915] 'renewPeriod' status.",
    "server delete prohibited": "The server set the status so that requests to delete the object MUST be rejected. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731], Extensible Provisioning Protocol (EPP) Host Mapping [RFC5732], and Extensible Provisioning Protocol (EPP) Contact Mapping [RFC5733] 'serverDeleteProhibited' status.",
    "server renew prohibited": "The server set the status so that requests to renew the object MUST be rejected. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731] 'serverRenewProhibited' status.",
    "server transfer prohibited": "The server set the status so that requests to transfer the object MUST be rejected. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731] and Extensible Provisioning Protocol (EPP) Contact Mapping [RFC5733] 'serverTransferProhibited' status.",
    "server update prohibited": "The server set the status so that requests to update the object (other than to remove this status) MUST be rejected. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731], Extensible Provisioning Protocol (EPP) Host Mapping [RFC5732], and Extensible Provisioning Protocol (EPP) Contact Mapping [RFC5733] 'serverUpdateProhibited' status.",
    "server hold": "The server set the status so that DNS delegation information MUST NOT be published for the object. This maps to the Extensible Provisioning Protocol (EPP) Domain Name Mapping [RFC5731] 'serverHold' status.",
    "transfer period": "This grace period is provided after the successful transfer of object registration sponsorship from one client to another client. If the object is deleted by the client during this period, the server provides a credit to the client for the cost of the transfer. This maps to the Domain Registry Grace Period Mapping for the Extensible Provisioning Protocol (EPP) [RFC3915] 'transferPeriod' status."
};

// list of RDAP bootstrap registry URLs
export const registryURLs: Record<string, ExtendedUri> = {
    "https://data.iana.org/rdap/asn.json": "autnum",
    "https://data.iana.org/rdap/dns.json": "domain",
    "https://data.iana.org/rdap/ipv4.json": "ip4",
    "https://data.iana.org/rdap/ipv6.json": "ip6",
    "https://data.iana.org/rdap/object-tags.json": "entity",
};

export const placeholders: Record<Uri, string> = {
    'ip': '192.168.0.1/16',
    'autnum': '65535',
    'entity': 'ABC123-EXAMPLE',
    'url': 'https://rdap.org/domain/example.com',
    'tld': 'example',
    'registrar': '9999',
    'json': '{ (paste JSON) }',
    'domain': 'example.com'
}