import type { FunctionComponent } from "react";
import { useMemo } from "react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import TimeAgo from "react-timeago";
import { Box, Button, Tooltip, Text, Flex } from "@radix-ui/themes";
import { useDateFormat } from "@/contexts/DateFormatContext";

type DynamicDateProps = {
	value: Date | number;
	absoluteFormat?: string;
	showTimezone?: boolean;
};

/**
 * A timestamp component with global format preferences.
 * Features:
 * - Toggle between relative and absolute time formats
 * - Global state - clicking any timestamp toggles all timestamps on the page
 * - Tooltip shows all formats (relative, absolute, ISO) with copy buttons
 * - Timezone support with automatic detection
 * - Minimal, clean design
 */
const DynamicDate: FunctionComponent<DynamicDateProps> = ({
	value,
	absoluteFormat,
	showTimezone = true,
}) => {
	const { format: dateFormat, toggleFormat } = useDateFormat();

	// Get user timezone
	const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const date = useMemo(() => new Date(value), [value]);

	// Format variants
	const absoluteFormatString = absoluteFormat ?? "PPP 'at' p";
	const absoluteWithTz = showTimezone
		? formatInTimeZone(date, userTimezone, `${absoluteFormatString} (zzz)`)
		: format(date, absoluteFormatString);
	const isoString = date.toISOString();

	// Get display value based on global format
	const displayValue = dateFormat === "relative" ? <TimeAgo date={date} /> : absoluteWithTz;

	return (
		<Tooltip
			content={
				<Box style={{ minWidth: "280px" }} as="span">
					<Flex align="center" justify="between" mb="2" as="span">
						<Text size="1">
							<strong>Relative:</strong> <TimeAgo date={date} />
						</Text>
					</Flex>
					<Flex align="center" justify="between" mb="2" as="span">
						<Text size="1">
							<strong>Absolute:</strong> {absoluteWithTz}
						</Text>
					</Flex>
					<Flex align="center" justify="between" as="span">
						<Text size="1" style={{ wordBreak: "break-all" }}>
							<strong>ISO:</strong> {isoString}
						</Text>
					</Flex>
				</Box>
			}
		>
			<Button variant="ghost" size="1" onClick={toggleFormat} style={{ cursor: "pointer" }}>
				<Text size="2">{displayValue}</Text>
			</Button>
		</Tooltip>
	);
};

export default DynamicDate;
