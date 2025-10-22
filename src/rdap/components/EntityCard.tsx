import type { FunctionComponent } from "react";
import React from "react";
import type { Entity } from "@/rdap/schemas";
import CopyButton from "@/components/CopyButton";
import AbstractCard from "@/components/AbstractCard";
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
					<Text size="5">{data.handle || data.roles.join(", ")}</Text>
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
				<DataList.Item align="center">
					<DataList.Label>Roles</DataList.Label>
					<DataList.Value>
						<Flex gap="2" wrap="wrap">
							{data.roles.map((role, index) => (
								<Badge key={index} color="gray" variant="soft" radius="full">
									{role}
								</Badge>
							))}
						</Flex>
					</DataList.Value>
				</DataList.Item>
				{data.publicIds && data.publicIds.length > 0 && (
					<DataList.Item align="center">
						<DataList.Label>Public IDs</DataList.Label>
						<DataList.Value>
							<Flex direction="column" gap="2">
								{data.publicIds.map((publicId, index) => (
									<Flex key={index} align="center" gap="2">
										<Code variant="ghost">
											{publicId.identifier} ({publicId.type})
										</Code>
										<CopyButton value={publicId.identifier} />
									</Flex>
								))}
							</Flex>
						</DataList.Value>
					</DataList.Item>
				)}
			</DataList.Root>
		</AbstractCard>
	);
};

export default EntityCard;
