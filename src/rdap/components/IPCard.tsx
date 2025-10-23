import type { FunctionComponent } from "react";
import React from "react";
import type { IpNetwork } from "@/rdap/schemas";
import Events from "@/rdap/components/Events";
import Property from "@/components/Property";
import CopyButton from "@/components/CopyButton";
import StatusBadge from "@/components/StatusBadge";
import AbstractCard from "@/components/AbstractCard";
import EntitiesSection from "@/rdap/components/EntitiesSection";
import LinksSection from "@/rdap/components/LinksSection";
import RemarksSection from "@/rdap/components/RemarksSection";
import { Flex, Text, DataList, Badge, Code } from "@radix-ui/themes";

export type IPCardProps = {
	data: IpNetwork;
	url?: string;
	queryTimestamp?: Date;
};

const IPCard: FunctionComponent<IPCardProps> = ({ data, url, queryTimestamp }: IPCardProps) => {
	return (
		<AbstractCard
			data={data}
			url={url}
			queryTimestamp={queryTimestamp}
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
				<DataList.Item>
					<DataList.Label>Handle</DataList.Label>
					<DataList.Value>
						<Flex align="center" gap="2">
							<Code variant="ghost">{data.handle}</Code>
							<CopyButton value={data.handle} />
						</Flex>
					</DataList.Value>
				</DataList.Item>
				<Property title="IP Version">{data.ipVersion.toUpperCase()}</Property>
				<DataList.Item>
					<DataList.Label>Start Address</DataList.Label>
					<DataList.Value>
						<Flex align="center" gap="2">
							<Code variant="ghost">{data.startAddress}</Code>
							<CopyButton value={data.startAddress} />
						</Flex>
					</DataList.Value>
				</DataList.Item>
				<DataList.Item>
					<DataList.Label>End Address</DataList.Label>
					<DataList.Value>
						<Flex align="center" gap="2">
							<Code variant="ghost">{data.endAddress}</Code>
							<CopyButton value={data.endAddress} />
						</Flex>
					</DataList.Value>
				</DataList.Item>
				{data.type && <Property title="Type">{data.type}</Property>}
				{data.country && <Property title="Country">{data.country}</Property>}
				{data.parentHandle && (
					<DataList.Item>
						<DataList.Label>Parent Handle</DataList.Label>
						<DataList.Value>
							<Flex align="center" gap="2">
								<Code variant="ghost">{data.parentHandle}</Code>
								<CopyButton value={data.parentHandle} />
							</Flex>
						</DataList.Value>
					</DataList.Item>
				)}
				{data.status && data.status.length > 0 && (
					<DataList.Item>
						<DataList.Label>Status</DataList.Label>
						<DataList.Value>
							<Flex gap="2" wrap="wrap">
								{data.status.map((status, index) => (
									<StatusBadge key={index} status={status} />
								))}
							</Flex>
						</DataList.Value>
					</DataList.Item>
				)}
				{data.port43 && (
					<DataList.Item>
						<DataList.Label>WHOIS Server</DataList.Label>
						<DataList.Value>
							<Flex align="center" gap="2">
								<Code variant="ghost">{data.port43}</Code>
								<CopyButton value={data.port43} />
							</Flex>
						</DataList.Value>
					</DataList.Item>
				)}
				{data.entities && data.entities.length > 0 && (
					<Property title="Entities">
						<EntitiesSection entities={data.entities} />
					</Property>
				)}
				{data.events && data.events.length > 0 && (
					<Property title="Events">
						<Events data={data.events} />
					</Property>
				)}
				{data.links && data.links.length > 0 && (
					<Property title="Links">
						<LinksSection links={data.links} />
					</Property>
				)}
				{data.remarks && data.remarks.length > 0 && (
					<Property title="Remarks">
						<RemarksSection remarks={data.remarks} />
					</Property>
				)}
			</DataList.Root>
		</AbstractCard>
	);
};

export default IPCard;
