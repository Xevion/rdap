import type { FunctionComponent } from "react";
import DomainCard from "@/components/lookup/DomainCard";
import IPCard from "@/components/lookup/IPCard";
import AutnumCard from "@/components/lookup/AutnumCard";
import type {
  Domain,
  AutonomousNumber,
  Entity,
  Nameserver,
  IpNetwork,
} from "@/types";
import AbstractCard from "@/components/common/AbstractCard";

export type ParsedGeneric =
  | Domain
  | Nameserver
  | Entity
  | AutonomousNumber
  | IpNetwork;

export type ObjectProps = {
  data: ParsedGeneric;
  url?: string;
};

const Generic: FunctionComponent<ObjectProps> = ({
  data,
  url,
}: ObjectProps) => {
  switch (data.objectClassName) {
    case "domain":
      return <DomainCard url={url} data={data} />;
    case "ip network":
      return <IPCard url={url} data={data} />;
    case "autnum":
      return <AutnumCard url={url} data={data} />;
    case "entity":
    case "nameserver":
    default:
      return (
        <AbstractCard url={url}>
          Not implemented. (<pre>{data.objectClassName ?? "null"}</pre>)
        </AbstractCard>
      );
  }

  // const title: string = (data.unicodeName ?? data.ldhName ?? data.handle)?.toUpperCase() ?? "Response";
  // return <div className="card">
  //     <div className="card-header">{title}</div>
  //     {objectFragment}
  // </div>
};

export default Generic;
