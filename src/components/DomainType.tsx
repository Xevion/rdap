import type {FunctionComponent} from "react";
import {useMemo} from "react";
import Domain from "./Domain";

export type Link = {
    value: string;
    rel: string;
    href: string;
    type: string
}
export type ObjectTypes = 'domain' | 'nameserver' | 'entity' | 'autnum' | 'ip network';

export type DomainType = {
    objectClassName: 'domain';
    handle: string;
    unicodeName: string;
    ldhName: string;
    links: Link[];
    nameservers: NameserverType[];
    entities: EntityType[];
    status: string[]
}

export type NameserverType = {
    objectClassName: 'nameserver';
};
export type EntityType = {
    objectClassName: 'entity';
};
export type AutnumType = {
    objectClassName: 'autnum';
};
export type IpNetworkType = {
    objectClassName: 'ip network';
};

export type ObjectProps = {
    data: DomainType | NameserverType | EntityType | AutnumType | IpNetworkType;
};

const GenericObject: FunctionComponent<ObjectProps> = ({data}: ObjectProps) => {
    switch (data.objectClassName) {
        case "domain":
            return <Domain data={data}/>
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

export default GenericObject;