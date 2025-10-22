import type { FunctionComponent } from "react";
import DomainCard from "@/components/lookup/DomainCard";
import IPCard from "@/components/lookup/IPCard";
import AutnumCard from "@/components/lookup/AutnumCard";
import EntityCard from "@/components/lookup/EntityCard";
import NameserverCard from "@/components/lookup/NameserverCard";
import type { Domain, AutonomousNumber, Entity, Nameserver, IpNetwork } from "@/types";
import AbstractCard from "@/components/common/AbstractCard";

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
