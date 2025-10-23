import type { FunctionComponent } from "react";
import React from "react";
import type { Domain } from "@/rdap/schemas";
import Events from "@/rdap/components/Events";
import Property from "@/components/Property";
import CopyButton from "@/components/CopyButton";
import StatusBadge from "@/components/StatusBadge";
import AbstractCard from "@/components/AbstractCard";
import NameserversSection from "@/rdap/components/NameserversSection";
import SecureDNSSection from "@/rdap/components/SecureDNSSection";
import EntitiesSection from "@/rdap/components/EntitiesSection";
import LinksSection from "@/rdap/components/LinksSection";
import RemarksSection from "@/rdap/components/RemarksSection";
import { Flex, Text, DataList, Badge, Code } from "@radix-ui/themes";

export type DomainProps = {
	data: Domain;
	url?: string;
	queryTimestamp?: Date;
};

const DomainCard: FunctionComponent<DomainProps> = ({ data, url, queryTimestamp }: DomainProps) => {
	return (
		<AbstractCard
			data={data}
			url={url}
			queryTimestamp={queryTimestamp}
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
				{data.handle != undefined ? (
					<DataList.Item>
						<DataList.Label>Handle</DataList.Label>
						<DataList.Value>
							<Flex align="center" gap="2">
								<Code variant="ghost">{data.handle}</Code>
								<CopyButton value={data.handle} />
							</Flex>
						</DataList.Value>
					</DataList.Item>
				) : null}
				{data.status && data.status.length > 0 && (
					<DataList.Item>
						<DataList.Label>Status</DataList.Label>
						<DataList.Value>
							<Flex gap="2" wrap="wrap">
								{data.status.map((statusKey, index) => (
									<StatusBadge key={index} status={statusKey} />
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
				{data.nameservers && data.nameservers.length > 0 && (
					<Property title="Nameservers">
						<NameserversSection nameservers={data.nameservers} />
					</Property>
				)}
				{data.secureDNS && (
					<Property title="DNSSEC">
						<SecureDNSSection secureDNS={data.secureDNS} />
					</Property>
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
				{data.notices && data.notices.length > 0 && (
					<Property title="Notices">
						<RemarksSection remarks={data.notices} />
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

export default DomainCard;
