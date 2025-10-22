import type { FunctionComponent } from "react";
import React from "react";
import type { AutonomousNumber } from "@/rdap/schemas";
import Events from "@/rdap/components/Events";
import Property from "@/components/Property";
import CopyButton from "@/components/CopyButton";
import StatusBadge from "@/components/StatusBadge";
import AbstractCard from "@/components/AbstractCard";
import { Flex, Text, DataList, Badge, Code } from "@radix-ui/themes";

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
				<DataList.Item>
					<DataList.Label>Handle</DataList.Label>
					<DataList.Value>
						<Flex align="center" gap="2">
							<Code variant="ghost">{data.handle}</Code>
							<CopyButton value={data.handle} />
						</Flex>
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>ASN Range</DataList.Label>
					<DataList.Value>
						<Flex align="center" gap="2">
							<Code variant="ghost">{asnRange}</Code>
							<CopyButton value={asnRange} />
						</Flex>
					</DataList.Value>
				</DataList.Item>
				<Property title="Type">{data.type}</Property>
				<Property title="Country">{data.country.toUpperCase()}</Property>
				<Property title="Events">
					<Events key={0} data={data.events} />
				</Property>
				<DataList.Item align="center">
					<DataList.Label>Status</DataList.Label>
					<DataList.Value>
						<Flex gap="2" wrap="wrap">
							{data.status.map((status, index) => (
								<StatusBadge key={index} status={status} />
							))}
						</Flex>
					</DataList.Value>
				</DataList.Item>
			</DataList.Root>
		</AbstractCard>
	);
};

export default AutnumCard;
