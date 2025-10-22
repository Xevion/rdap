import type { FunctionComponent } from "react";
import React from "react";
import type { Entity, RdapStatusType } from "@/rdap/schemas";
import CopyButton from "@/components/CopyButton";
import StatusBadge from "@/components/StatusBadge";
import AbstractCard from "@/components/AbstractCard";
import Property from "@/components/Property";
import VCardDisplay from "@/rdap/components/VCardDisplay";
import Events from "@/rdap/components/Events";
import LinksSection from "@/rdap/components/LinksSection";
import RemarksSection from "@/rdap/components/RemarksSection";
import EntitiesSection from "@/rdap/components/EntitiesSection";
import { Flex, DataList, Badge, Text, Code } from "@radix-ui/themes";

export type EntityCardProps = {
	data: Entity;
	url?: string;
};

const EntityCard: FunctionComponent<EntityCardProps> = ({ data, url }: EntityCardProps) => {
	return (
		<AbstractCard
			data={data}
			url={url}
			header={
				<Flex gap="2" align="center" wrap="wrap">
					<Text size="5">
						{data.handle || (data.roles && data.roles.join(", ")) || "Entity"}
					</Text>
					<Badge color="gray">ENTITY</Badge>
				</Flex>
			}
		>
			<DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
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
				{data.roles && data.roles.length > 0 && (
					<DataList.Item>
						<DataList.Label>Roles</DataList.Label>
						<DataList.Value>
							<Flex gap="2" wrap="wrap">
								{data.roles.map((role: string, index: number) => (
									<Badge key={index} color="gray" variant="soft" radius="full">
										{role}
									</Badge>
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
								{data.status.map((status: RdapStatusType, index: number) => (
									<StatusBadge key={index} status={status} />
								))}
							</Flex>
						</DataList.Value>
					</DataList.Item>
				)}
				{data.publicIds && data.publicIds.length > 0 && (
					<DataList.Item>
						<DataList.Label>Public IDs</DataList.Label>
						<DataList.Value>
							<Flex direction="column" gap="2">
								{data.publicIds.map(
									(
										publicId: { type: string; identifier: string },
										index: number
									) => (
										<Flex key={index} align="center" gap="2">
											<Code variant="ghost">
												{publicId.identifier} ({publicId.type})
											</Code>
											<CopyButton value={publicId.identifier} />
										</Flex>
									)
								)}
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
				{data.vcardArray && (
					<Property title="Contact Information">
						<VCardDisplay vcardArray={data.vcardArray} />
					</Property>
				)}
				{data.entities && data.entities.length > 0 && (
					<Property title="Associated Entities">
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

export default EntityCard;
