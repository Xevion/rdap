import type { FunctionComponent } from "react";
import { useState, useCallback, useEffect } from "react";
import { Link2Icon, CheckIcon } from "@radix-ui/react-icons";
import { IconButton, Tooltip } from "@radix-ui/themes";

export type ShareButtonProps = {
	/**
	 * The URL to copy when the button is clicked
	 */
	url: string;
	/**
	 * Button size (1, 2, or 3)
	 */
	size?: "1" | "2" | "3";
	/**
	 * Button variant
	 */
	variant?: "classic" | "solid" | "soft" | "surface" | "outline" | "ghost";
};

const ShareButton: FunctionComponent<ShareButtonProps> = ({
	url,
	size = "1",
	variant = "ghost",
}) => {
	const [copied, setCopied] = useState(false);

	// Reset copied state after 2 seconds
	useEffect(() => {
		if (copied) {
			const timer = setTimeout(() => setCopied(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [copied]);

	const handleShare = useCallback(() => {
		navigator.clipboard.writeText(url).then(
			() => {
				setCopied(true);
			},
			(err) => {
				if (err instanceof Error) {
					console.error(`Failed to copy URL to clipboard: ${err.toString()}`);
				} else {
					console.error("Failed to copy URL to clipboard.");
				}
			}
		);
	}, [url]);

	return (
		<Tooltip content={copied ? "Copied!" : "Copy shareable link"}>
			<IconButton
				size={size}
				variant={variant}
				color={copied ? "green" : "gray"}
				aria-label="Copy shareable link"
				onClick={handleShare}
			>
				{copied ? <CheckIcon /> : <Link2Icon />}
			</IconButton>
		</Tooltip>
	);
};

export default ShareButton;
