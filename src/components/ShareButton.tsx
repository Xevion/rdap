import type { FunctionComponent } from "react";
import { Link2Icon } from "@radix-ui/react-icons";
import CopyButton, { type CopyButtonProps } from "@/components/CopyButton";

export type ShareButtonProps = Omit<CopyButtonProps, "value"> & {
	/**
	 * The URL to copy when the button is clicked
	 */
	url: string;
};

const ShareButton: FunctionComponent<ShareButtonProps> = ({
	url,
	icon = Link2Icon,
	iconSize = 18,
	tooltipText = "Copy shareable link",
	...copyButtonProps
}) => {
	// Development-time URL validation
	if (process.env.NODE_ENV === "development") {
		try {
			new URL(url);
		} catch {
			console.warn(`ShareButton received invalid URL: ${url}`);
		}
	}

	return (
		<CopyButton
			{...copyButtonProps}
			value={url}
			icon={icon}
			iconSize={iconSize}
			tooltipText={tooltipText}
		/>
	);
};

export default ShareButton;
