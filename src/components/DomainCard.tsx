import type {FunctionComponent, ReactNode} from "react";
import React, {Fragment} from "react";
import {rdapStatusInfo} from "@/constants";
import type {Domain} from "@/schema";
import Events from "@/components/Events"

export type DomainProps = {
    data: Domain;
};

const DomainCard: FunctionComponent<DomainProps> = ({data}: DomainProps) => {
    const properties: [string | ReactNode, string | ReactNode][] = [];

    if (data.unicodeName) {
        properties.push(["Name", data.unicodeName]);
        properties.push(["ASCII Name", data.ldhName]);
    } else {
        properties.push(["Name", data.ldhName])
    }

    properties.push(["Handle", data.handle]);
    properties.push(["Events", <Events key={0} data={data.events} />])

    properties.push([
        "Status",
        <ul key={2} className="list-disc">
            {data.status.map((statusKey, index) =>
                <li title={rdapStatusInfo[statusKey]} key={index}>
                    {statusKey}
                </li>)}
        </ul>
    ])
    return <div className="card">
        <div className="card-header">{data.ldhName ?? data.unicodeName} ({data.handle})</div>
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

export default DomainCard;