import type { FunctionComponent } from "react";
import React from "react";
import type { Nameserver } from "@/rdap/schemas";
import CopyButton from "@/components/CopyButton";
import StatusBadge from "@/components/StatusBadge";
import AbstractCard from "@/components/AbstractCard";
import Property from "@/components/Property";
import Events from "@/rdap/components/Events";
import LinksSection from "@/rdap/components/LinksSection";
import RemarksSection from "@/rdap/components/RemarksSection";
import EntitiesSection from "@/rdap/components/EntitiesSection";
import { Flex, DataList, Badge, Text, Code } from "@radix-ui/themes";

export type NameserverCardProps = {
	data: Nameserver;
	url?: string;
	queryTimestamp?: Date;
};

const NameserverCard: FunctionComponent<NameserverCardProps> = ({
	data,
	url,
	queryTimestamp,
}: NameserverCardProps) => {
	return (
		<AbstractCard
			data={data}
			url={url}
			queryTimestamp={queryTimestamp}
			header={
				<Flex gap="2" align="center" wrap="wrap">
					<Text size="5">{data.ldhName}</Text>
					<Badge color="gray">NAMESERVER</Badge>
				</Flex>
			}
		>
			<DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
				{data.unicodeName && data.unicodeName !== data.ldhName && (
					<DataList.Item>
						<DataList.Label>Unicode Name</DataList.Label>
						<DataList.Value>
							<Flex align="center" gap="2">
								<Code variant="ghost">{data.unicodeName}</Code>
								<CopyButton value={data.unicodeName} />
							</Flex>
						</DataList.Value>
					</DataList.Item>
				)}
				<DataList.Item>
					<DataList.Label>{data.unicodeName ? "LDH Name" : "Name"}</DataList.Label>
					<DataList.Value>
						<Flex align="center" gap="2">
							<Code variant="ghost">{data.ldhName}</Code>
							<CopyButton value={data.ldhName} />
						</Flex>
					</DataList.Value>
				</DataList.Item>
				{data.handle && (
					<DataList.Item>
						<DataList.Label>Handle</DataList.Label>
						<DataList.Value>
							<Flex align="center" gap="2">
								<Code variant="ghost">{data.handle}</Code>
								<CopyButton value={data.handle} />
							</Flex>
						</DataList.Value>
					</DataList.Item>
				)}
				{data.ipAddresses?.v4 && data.ipAddresses.v4.length > 0 && (
					<DataList.Item>
						<DataList.Label>IPv4 Addresses</DataList.Label>
						<DataList.Value>
							<Flex direction="column" gap="1">
								{data.ipAddresses.v4.map((ip, index) => (
									<Flex key={index} align="center" gap="2">
										<Code variant="ghost">{ip}</Code>
										<CopyButton value={ip} />
									</Flex>
								))}
							</Flex>
						</DataList.Value>
					</DataList.Item>
				)}
				{data.ipAddresses?.v6 && data.ipAddresses.v6.length > 0 && (
					<DataList.Item>
						<DataList.Label>IPv6 Addresses</DataList.Label>
						<DataList.Value>
							<Flex direction="column" gap="1">
								{data.ipAddresses.v6.map((ip, index) => (
									<Flex key={index} align="center" gap="2">
										<Code variant="ghost">{ip}</Code>
										<CopyButton value={ip} />
									</Flex>
								))}
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

export default NameserverCard;
