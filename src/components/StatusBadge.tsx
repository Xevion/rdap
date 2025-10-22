import type { FunctionComponent } from "react";
import React from "react";
import type { RdapStatusType } from "@/rdap/schemas";
import { rdapStatusColors, rdapStatusInfo } from "@/rdap/constants";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import { Badge, HoverCard, Text, Flex } from "@radix-ui/themes";

export type StatusBadgeProps = {
	status: RdapStatusType;
};

const StatusBadge: FunctionComponent<StatusBadgeProps> = ({ status }) => {
	return (
		<HoverCard.Root>
			<HoverCard.Trigger>
				<Badge
					color={rdapStatusColors[status]}
					variant="soft"
					radius="full"
					size="2"
					style={{ cursor: "help" }}
				>
					<Flex align="center" gap="1">
						{status}
						<QuestionMarkIcon width="12" height="12" />
					</Flex>
				</Badge>
			</HoverCard.Trigger>
			<HoverCard.Content maxWidth="400px">
				<Text size="2">{rdapStatusInfo[status]}</Text>
			</HoverCard.Content>
		</HoverCard.Root>
	);
};

export default StatusBadge;
