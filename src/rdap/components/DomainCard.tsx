import type { FunctionComponent } from "react";
import React from "react";
import type { Domain } from "@/rdap/schemas";
import Events from "@/rdap/components/Events";
import Property from "@/components/Property";
import CopyButton from "@/components/CopyButton";
import StatusBadge from "@/components/StatusBadge";
import AbstractCard from "@/components/AbstractCard";
import { Flex, Text, DataList, Badge, Code } from "@radix-ui/themes";

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
					<DataList.Item>
						<DataList.Label>Unicode Name</DataList.Label>
						<DataList.Value>
							<Flex align="center" gap="2">
								<Code variant="ghost">{data.unicodeName}</Code>
								<CopyButton value={data.unicodeName} />
							</Flex>
						</DataList.Value>
					</DataList.Item>
				) : null}
				<DataList.Item>
					<DataList.Label>
						{data.unicodeName != undefined ? "LDH Name" : "Name"}
					</DataList.Label>
					<DataList.Value>
						<Flex align="center" gap="2">
							<Code variant="ghost">{data.ldhName}</Code>
							<CopyButton value={data.ldhName} />
						</Flex>
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>Handle</DataList.Label>
					<DataList.Value>
						<Flex align="center" gap="2">
							<Code variant="ghost">{data.handle}</Code>
							<CopyButton value={data.handle} />
						</Flex>
					</DataList.Value>
				</DataList.Item>
				<Property title="Events">
					<Events key={0} data={data.events} />
				</Property>
				<DataList.Item align="center">
					<DataList.Label>Status</DataList.Label>
					<DataList.Value>
						<Flex gap="2" wrap="wrap">
							{data.status.map((statusKey, index) => (
								<StatusBadge key={index} status={statusKey} />
							))}
						</Flex>
					</DataList.Value>
				</DataList.Item>
			</DataList.Root>
		</AbstractCard>
	);
};

export default DomainCard;
