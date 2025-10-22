import type { FunctionComponent } from "react";
import React from "react";
import type { Entity } from "@/rdap/schemas";
import Property from "@/components/Property";
import PropertyList from "@/components/PropertyList";
import AbstractCard from "@/components/AbstractCard";
import { Flex, DataList, Badge, Text } from "@radix-ui/themes";

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
				{data.handle && <Property title="Handle">{data.handle}</Property>}
				<PropertyList title="Roles">
					{data.roles.map((role, index) => (
						<PropertyList.Item key={index} title={role}>
							{role}
						</PropertyList.Item>
					))}
				</PropertyList>
				{data.publicIds && data.publicIds.length > 0 && (
					<PropertyList title="Public IDs">
						{data.publicIds.map((publicId, index) => (
							<PropertyList.Item key={index} title={publicId.type}>
								{`${publicId.identifier} (${publicId.type})`}
							</PropertyList.Item>
						))}
					</PropertyList>
				)}
			</DataList.Root>
		</AbstractCard>
	);
};

export default EntityCard;
