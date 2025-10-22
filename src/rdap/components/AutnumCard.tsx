import type { FunctionComponent } from "react";
import React from "react";
import type { AutonomousNumber } from "@/rdap/schemas";
import Events from "@/rdap/components/Events";
import Property from "@/components/Property";
import PropertyList from "@/components/PropertyList";
import AbstractCard from "@/components/AbstractCard";
import { Flex, Text, DataList, Badge } from "@radix-ui/themes";

export type AutnumCardProps = {
	data: AutonomousNumber;
	url?: string;
};

const AutnumCard: FunctionComponent<AutnumCardProps> = ({ data, url }: AutnumCardProps) => {
	const asnRange =
		data.startAutnum === data.endAutnum
			? `AS${data.startAutnum}`
			: `AS${data.startAutnum}-AS${data.endAutnum}`;

	return (
		<AbstractCard
			data={data}
			url={url}
			header={
				<Flex gap="2" align="center" wrap="wrap">
					<Text size="5">{asnRange}</Text>
					<Badge color="gray">AUTONOMOUS SYSTEM</Badge>
				</Flex>
			}
		>
			<DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
				<Property title="Name">{data.name}</Property>
				<Property title="Handle">{data.handle}</Property>
				<Property title="ASN Range">
					{data.startAutnum === data.endAutnum
						? `AS${data.startAutnum}`
						: `AS${data.startAutnum} - AS${data.endAutnum}`}
				</Property>
				<Property title="Type">{data.type}</Property>
				<Property title="Country">{data.country.toUpperCase()}</Property>
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

export default AutnumCard;
