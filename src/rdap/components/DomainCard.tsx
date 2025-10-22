import type { FunctionComponent } from "react";
import React from "react";
import { rdapStatusInfo } from "@/rdap/constants";
import type { Domain } from "@/rdap/schemas";
import Events from "@/rdap/components/Events";
import Property from "@/components/Property";
import PropertyList from "@/components/PropertyList";
import AbstractCard from "@/components/AbstractCard";
import { Flex, Text, DataList, Badge } from "@radix-ui/themes";

export type DomainProps = {
	data: Domain;
	url?: string;
};

const DomainCard: FunctionComponent<DomainProps> = ({ data, url }: DomainProps) => {
	return (
		<AbstractCard
			data={data}
			url={url}
			header={
				<Flex gap="2" align="center" wrap="wrap">
					<Text size="5">{data.ldhName ?? data.unicodeName}</Text>
					<Badge color="gray">DOMAIN</Badge>
				</Flex>
			}
		>
			<DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
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
			</DataList.Root>
		</AbstractCard>
	);
};

export default DomainCard;
