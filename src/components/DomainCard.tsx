import type {FunctionComponent} from "react";
import React from "react";
import {rdapStatusInfo} from "@/constants";
import type {Domain} from "@/types";
import Events from "@/components/Events"
import Property from "@/components/Property";

export type DomainProps = {
    data: Domain;
};

const DomainCard: FunctionComponent<DomainProps> = ({data}: DomainProps) => {
    return <div className="card">
        <div className="card-header">{data.ldhName ?? data.unicodeName} ({data.handle})</div>
        <div className="card-body">
            <dl>
                {data.unicodeName != undefined ? <Property title="Unicode Name">
                    {data.unicodeName}
                </Property> : null}
                <Property title={data.unicodeName != undefined ? "LHD Name" : "Name"}>
                    {data.ldhName}
                </Property>
                <Property title="Handle">
                    {data.handle}
                </Property>
                <Property title="Events">
                    <Events key={0} data={data.events}/>
                </Property>
                <Property title="Status">
                    <ul key={2} className="list-disc">
                        {data.status.map((statusKey, index) =>
                            <li key={index}>
                                <span title={rdapStatusInfo[statusKey]}>{statusKey}</span>
                            </li>)}
                    </ul>
                </Property>
            </dl>
        </div>
    </div>
}

export default DomainCard;