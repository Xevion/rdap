import type { FunctionComponent } from "react";
import React from "react";
import type { Nameserver } from "@/rdap/schemas";
import CopyButton from "@/components/CopyButton";
import AbstractCard from "@/components/AbstractCard";
import { Flex, DataList, Badge, Text, Code } from "@radix-ui/themes";

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
				<DataList.Item>
					<DataList.Label>LDH Name</DataList.Label>
					<DataList.Value>
						<Flex align="center" gap="2">
							<Code variant="ghost">{data.ldhName}</Code>
							<CopyButton value={data.ldhName} />
						</Flex>
					</DataList.Value>
				</DataList.Item>
			</DataList.Root>
		</AbstractCard>
	);
};

export default NameserverCard;
