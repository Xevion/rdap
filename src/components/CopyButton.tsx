import type { FunctionComponent, ReactNode } from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { CheckIcon, ClipboardIcon } from "@radix-ui/react-icons";
import type { IconButtonProps } from "@radix-ui/themes";
import { IconButton, Tooltip } from "@radix-ui/themes";

/**
 * Duration in milliseconds for how long the "copied" state persists
 * (affects both checkmark icon and tooltip display)
 */
const COPIED_STATE_DURATION_MS = 1000;

// Shared button prop types exported for reuse in other components
export type ButtonSize = IconButtonProps["size"];
export type ButtonVariant = IconButtonProps["variant"];
export type ButtonColor = IconButtonProps["color"];

export type CopyButtonProps = {
	/**
	 * The value to copy to clipboard when the button is clicked
	 */
	value: string;
	/**
	 * Button size (1, 2, or 3)
	 */
	size?: ButtonSize;
	/**
	 * Button variant
	 */
	variant?: ButtonVariant;
	/**
	 * Button color when not in copied state
	 * @default "gray"
	 * Pass null to use default button color (no color prop set)
	 */
	color?: ButtonColor | null;
	/**
	 * Optional custom icon to show when not copied (defaults to ClipboardIcon)
	 */
	icon?: ReactNode;
	/**
	 * Tooltip text to show when not copied (defaults to "Copy to Clipboard")
	 */
	tooltipText?: string;
};

const CopyButton: FunctionComponent<CopyButtonProps> = ({
	value,
	size = "1",
	variant = "ghost",
	color = "gray",
	icon,
	tooltipText = "Copy to Clipboard",
}) => {
	const [copied, setCopied] = useState(false);
	const [tooltipOpen, setTooltipOpen] = useState(false);
	const forceOpenRef = useRef(false);

	// Consolidated timer effect: Reset copied state, tooltip, and force-open flag
	useEffect(() => {
		if (copied) {
			forceOpenRef.current = true;
			setTooltipOpen(true);

			const timer = setTimeout(() => {
				setCopied(false);
				forceOpenRef.current = false;
				setTooltipOpen(false);
			}, COPIED_STATE_DURATION_MS);

			return () => clearTimeout(timer);
		}
	}, [copied]);

	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(value).then(
			() => {
				setCopied(true);
			},
			(err) => {
				console.error("Failed to copy to clipboard:", err);
			}
		);
	}, [value]);

	const handleTooltipOpenChange = useCallback((open: boolean) => {
		// Don't allow the tooltip to close if we're in the forced-open period
		if (!open && forceOpenRef.current) {
			return;
		}
		setTooltipOpen(open);
	}, []);

	return (
		<Tooltip
			content={copied ? "Copied!" : tooltipText}
			open={tooltipOpen}
			onOpenChange={handleTooltipOpenChange}
		>
			<IconButton
				size={size}
				variant={variant}
				color={copied ? "green" : (color ?? undefined)}
				aria-label={copied ? "Copied!" : tooltipText}
				onClick={handleCopy}
			>
				{copied ? <CheckIcon /> : (icon ?? <ClipboardIcon />)}
			</IconButton>
		</Tooltip>
	);
};

export default CopyButton;
