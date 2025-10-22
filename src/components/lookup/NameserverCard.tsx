import type { FunctionComponent } from "react";
import React from "react";
import type { Nameserver } from "@/types";
import Property from "@/components/common/Property";
import AbstractCard from "@/components/common/AbstractCard";
import { Flex, DataList, Badge, Text } from "@radix-ui/themes";

export type NameserverCardProps = {
	data: Nameserver;
	url?: string;
};

const NameserverCard: FunctionComponent<NameserverCardProps> = ({
	data,
	url,
}: NameserverCardProps) => {
	return (
		<AbstractCard
			data={data}
			url={url}
			header={
				<Flex gap="2" align="center" wrap="wrap">
					<Text size="5">{data.ldhName}</Text>
					<Badge color="gray">NAMESERVER</Badge>
				</Flex>
			}
		>
			<DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
				<Property title="LDH Name">{data.ldhName}</Property>
			</DataList.Root>
		</AbstractCard>
	);
};

export default NameserverCard;
