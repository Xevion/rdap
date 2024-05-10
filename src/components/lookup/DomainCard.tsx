import type { FunctionComponent } from "react";
import React from "react";
import { rdapStatusInfo } from "@/constants";
import type { Domain } from "@/types";
import Events from "@/components/lookup/Events";
import Property from "@/components/common/Property";
import PropertyList from "@/components/common/PropertyList";
import AbstractCard from "@/components/common/AbstractCard";

export type DomainProps = {
  data: Domain;
};

const DomainCard: FunctionComponent<DomainProps> = ({ data }: DomainProps) => {
  return (
    <AbstractCard
      data={data}
      header={
        <>
          <span className="font-mono tracking-tighter">DOMAIN</span>
          <span className="font-mono tracking-wide">{data.ldhName ?? data.unicodeName}</span>
          <span className="whitespace-nowrap">({data.handle})</span>
        </>
      }
    >
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
        <PropertyList title="Status">
          {data.status.map((statusKey, index) => (
            <PropertyList.Item key={index} title={rdapStatusInfo[statusKey]}>
              {statusKey}
            </PropertyList.Item>
          ))}
        </PropertyList>
      </dl>
    </AbstractCard>
  );
};

export default DomainCard;
