import type { FunctionComponent } from "react";
import { useBoolean } from "usehooks-ts";
import { format } from "date-fns";
import TimeAgo from "react-timeago";
import { Button, Text } from "@radix-ui/themes";

type DynamicDateProps = {
	value: Date | number;
	absoluteFormat?: string;
};

/**
 * A component for a toggleable switch between the absolute & human-relative date.
 * @param value The date to be displayed, the Date value, or
 * @param absoluteFormat Optional - the date-fns format string to use for the absolute date rendering.
 */
const DynamicDate: FunctionComponent<DynamicDateProps> = ({ value, absoluteFormat }) => {
	const { value: showAbsolute, toggle: toggleFormat } = useBoolean(true);

	const date = new Date(value);
	return (
		<Button
			variant="ghost"
			size="1"
			onClick={toggleFormat}
			style={{ padding: 0, height: "auto" }}
		>
			<Text className="dashed" title={date.toISOString()} size="2">
				{showAbsolute ? (
					format(date, absoluteFormat ?? "LLL do, y HH:mm:ss xxx")
				) : (
					<TimeAgo date={date} />
				)}
			</Text>
		</Button>
	);
};

export default DynamicDate;
