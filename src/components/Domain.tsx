import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {DomainType} from "./DomainType";
import {rdapStatusInfo} from "../constants";

export type DomainProps = {
    data: DomainType;
};

const Domain: FunctionComponent<DomainProps> = ({data}: DomainProps) => {
    const properties: [string | ReactNode, string | ReactNode][] = [];

    if (data.unicodeName) {
        properties.push(["Name", data.unicodeName]);
        properties.push(["ASCII Name", data.ldhName]);
    } else {
        properties.push(["Name", data.ldhName])
    }

    if (data.handle) properties.push(["Handle", data.handle]);
    // if (data.events) properties.push
    if (data.status) properties.push([
        "Status",
        data.status.map((statusKey, index) =>
            <span title={rdapStatusInfo[statusKey]!} key={index}>
            {statusKey}
        </span>)
    ])

    return <div className="card">
        <div className="card-header">{data.name} ({data.handle})</div>
        <div className="card-body">
            <dl>
                {
                    properties.map(([name, value], index) => {
                            return <Fragment key={index}>
                                <dt>{name}:</dt>
                                <dd className="mt-2 mb-2 ml-6">{value}</dd>
                            </Fragment>
                        }
                    )}
            </dl>
        </div>
    </div>
}

export default Domain;