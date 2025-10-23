import type { FunctionComponent } from "react";
import { Text } from "@radix-ui/themes";

/**
 * A reusable em dash component for displaying placeholder text in tables.
 */
const EmDash: FunctionComponent = () => {
	return (
		<Text
			size="2"
			style={{
				color: "var(--gray-a8)",
				userSelect: "none",
			}}
		>
			&mdash;
		</Text>
	);
};

export default EmDash;
