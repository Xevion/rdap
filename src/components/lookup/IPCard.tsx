import type { FunctionComponent } from "react";
import React from "react";
import type { IpNetwork } from "@/types";
import Events from "@/components/lookup/Events";
import Property from "@/components/common/Property";
import PropertyList from "@/components/common/PropertyList";
import AbstractCard from "@/components/common/AbstractCard";

export type IPCardProps = {
  data: IpNetwork;
  url?: string;
};

const IPCard: FunctionComponent<IPCardProps> = ({
  data,
  url,
}: IPCardProps) => {
  return (
    <AbstractCard
      data={data}
      url={url}
      header={
        <>
          <span className="font-mono tracking-tighter">IP NETWORK</span>
          <span className="font-mono tracking-wide">
            {data.startAddress}
            {data.startAddress !== data.endAddress && ` - ${data.endAddress}`}
          </span>
          <span className="whitespace-nowrap">({data.handle})</span>
        </>
      }
    >
      <dl>
        <Property title="Name">{data.name}</Property>
        <Property title="Handle">{data.handle}</Property>
        <Property title="IP Version">{data.ipVersion.toUpperCase()}</Property>
        <Property title="Start Address">{data.startAddress}</Property>
        <Property title="End Address">{data.endAddress}</Property>
        <Property title="Type">{data.type}</Property>
        {data.country && (
          <Property title="Country">{data.country}</Property>
        )}
        {data.parentHandle && (
          <Property title="Parent Handle">{data.parentHandle}</Property>
        )}
        <Property title="Events">
          <Events key={0} data={data.events} />
        </Property>
        <PropertyList title="Status">
          {data.status.map((status, index) => (
            <PropertyList.Item key={index} title={status}>
              {status}
            </PropertyList.Item>
          ))}
        </PropertyList>
      </dl>
    </AbstractCard>
  );
};

export default IPCard;
