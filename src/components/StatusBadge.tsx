import type { FunctionComponent } from "react";
import React from "react";
import type { RdapStatusType } from "@/rdap/schemas";
import { rdapStatusColors, rdapStatusInfo } from "@/rdap/constants";
import { QuestionMarkIcon } from "@radix-ui/react-icons";
import { Badge, Tooltip, Flex } from "@radix-ui/themes";

export type StatusBadgeProps = {
	status: RdapStatusType;
};

const StatusBadge: FunctionComponent<StatusBadgeProps> = ({ status }) => {
	return (
		<Tooltip content={rdapStatusInfo[status]}>
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
		</Tooltip>
	);
};

export default StatusBadge;
