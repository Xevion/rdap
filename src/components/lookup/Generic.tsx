import type { FunctionComponent } from "react";
import DomainCard from "@/components/lookup/DomainCard";
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
};

const Generic: FunctionComponent<ObjectProps> = ({ data }: ObjectProps) => {
  switch (data.objectClassName) {
    case "domain":
      return <DomainCard data={data} />;
    case "autnum":
    case "entity":
    case "ip network":
    case "nameserver":
    default:
      return (
        <AbstractCard>
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
