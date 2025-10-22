import type { FunctionComponent } from "react";
import DomainCard from "@/rdap/components/DomainCard";
import IPCard from "@/rdap/components/IPCard";
import AutnumCard from "@/rdap/components/AutnumCard";
import EntityCard from "@/rdap/components/EntityCard";
import NameserverCard from "@/rdap/components/NameserverCard";
import type { Domain, AutonomousNumber, Entity, Nameserver, IpNetwork } from "@/rdap/schemas";
import AbstractCard from "@/components/AbstractCard";

export type ParsedGeneric = Domain | Nameserver | Entity | AutonomousNumber | IpNetwork;

export type ObjectProps = {
	data: ParsedGeneric;
	url?: string;
};

const Generic: FunctionComponent<ObjectProps> = ({ data, url }: ObjectProps) => {
	const objectClassName = data.objectClassName;

	switch (objectClassName) {
		case "domain":
			return <DomainCard url={url} data={data} />;
		case "ip network":
			return <IPCard url={url} data={data} />;
		case "autnum":
			return <AutnumCard url={url} data={data} />;
		case "entity":
			return <EntityCard url={url} data={data} />;
		case "nameserver":
			return <NameserverCard url={url} data={data} />;
		default:
			return (
				<AbstractCard url={url}>
					Not implemented. (<pre>{objectClassName ?? "null"}</pre>)
				</AbstractCard>
			);
	}
};

export default Generic;
