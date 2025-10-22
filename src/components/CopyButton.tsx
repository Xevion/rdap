import type { FunctionComponent } from "react";
import React from "react";
import { ClipboardIcon } from "@radix-ui/react-icons";
import { IconButton } from "@radix-ui/themes";

export type CopyButtonProps = {
	value: string;
	size?: "1" | "2" | "3";
};

const CopyButton: FunctionComponent<CopyButtonProps> = ({ value, size = "1" }) => {
	const handleCopy = () => {
		navigator.clipboard.writeText(value).then(
			() => {
				// Successfully copied to clipboard
			},
			(err) => {
				if (err instanceof Error) {
					console.error(`Failed to copy to clipboard (${err.toString()}).`);
				} else {
					console.error("Failed to copy to clipboard.");
				}
			}
		);
	};

	return (
		<IconButton
			size={size}
			aria-label="Copy value"
			color="gray"
			variant="ghost"
			onClick={handleCopy}
		>
			<ClipboardIcon />
		</IconButton>
	);
};

export default CopyButton;
