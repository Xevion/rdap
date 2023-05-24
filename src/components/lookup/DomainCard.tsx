import type { FunctionComponent } from "react";
import React from "react";
import { rdapStatusInfo } from "@/constants";
import type { Domain } from "@/types";
import Events from "@/components/lookup/Events";
import Property from "@/components/common/Property";

export type DomainProps = {
  data: Domain;
};

const DomainCard: FunctionComponent<DomainProps> = ({ data }: DomainProps) => {
  return (
    <div className="mb-4 overflow-clip rounded bg-zinc-800">
      <div className="bg-zinc-700 p-2 pl-5">
        <span className="font-mono">{data.ldhName ?? data.unicodeName}</span> (
        {data.handle})
      </div>
      <div className="p-2 px-4">
        <dl>
          {data.unicodeName != undefined ? (
            <Property title="Unicode Name">{data.unicodeName}</Property>
          ) : null}
          <Property title={data.unicodeName != undefined ? "LHD Name" : "Name"}>
            {data.ldhName}
          </Property>
          <Property title="Handle">{data.handle}</Property>
          <Property title="Events">
            <Events key={0} data={data.events} />
          </Property>
          <Property title="Status">
            <ul key={2} className="list-disc">
              {data.status.map((statusKey, index) => (
                <li key={index}>
                  <span title={rdapStatusInfo[statusKey]}>{statusKey}</span>
                </li>
              ))}
            </ul>
          </Property>
        </dl>
      </div>
    </div>
  );
};

export default DomainCard;
