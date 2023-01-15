import type {FunctionComponent} from "react";
import DomainCard from "@/components/DomainCard";
import type {Domain, AutonomousNumber, Entity, Nameserver, IpNetwork} from "@/responses";

export type ParsedGeneric = Domain | Nameserver | Entity | AutonomousNumber | IpNetwork;
export type ObjectProps = {
    data: ParsedGeneric;
};

const Generic: FunctionComponent<ObjectProps> = ({data}: ObjectProps) => {
    switch (data.objectClassName) {
        case "domain":
            return <DomainCard data={data}/>
        case "autnum":
        case "entity":
        case "ip network":
        case "nameserver":
        default:
            return <div className="card my-2">
                <div className="card-header">Not implemented</div>
            </div>
    }

    // const title: string = (data.unicodeName ?? data.ldhName ?? data.handle)?.toUpperCase() ?? "Response";
    // return <div className="card">
    //     <div className="card-header">{title}</div>
    //     {objectFragment}
    // </div>
}

export default Generic;