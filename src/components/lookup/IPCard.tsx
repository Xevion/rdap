import type { FunctionComponent } from "react";
import React from "react";
import type { IpNetwork } from "@/types";
import Events from "@/components/lookup/Events";
import Property from "@/components/common/Property";
import PropertyList from "@/components/common/PropertyList";
import AbstractCard from "@/components/common/AbstractCard";
import { Flex, Text, DataList, Badge } from "@radix-ui/themes";

export type IPCardProps = {
	data: IpNetwork;
	url?: string;
};

const IPCard: FunctionComponent<IPCardProps> = ({ data, url }: IPCardProps) => {
	return (
		<AbstractCard
			data={data}
			url={url}
			header={
				<Flex gap="2" align="center" wrap="wrap">
					<Text size="5">
						{data.startAddress} - {data.endAddress}
					</Text>
					<Badge color="gray">IP NETWORK</Badge>
				</Flex>
			}
		>
			<DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
				<Property title="Name">{data.name}</Property>
				<Property title="Handle">{data.handle}</Property>
				<Property title="IP Version">{data.ipVersion.toUpperCase()}</Property>
				<Property title="Start Address">{data.startAddress}</Property>
				<Property title="End Address">{data.endAddress}</Property>
				<Property title="Type">{data.type}</Property>
				{data.country && <Property title="Country">{data.country}</Property>}
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
			</DataList.Root>
		</AbstractCard>
	);
};

export default IPCard;
