import type { FunctionComponent, ComponentType } from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import { CheckIcon, ClipboardIcon } from "@radix-ui/react-icons";
import type { IconButtonProps } from "@radix-ui/themes";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { useTelemetry } from "@/contexts/TelemetryContext";

/**
 * Duration in milliseconds for how long the "copied" state persists
 * (affects both checkmark icon and tooltip display)
 */
const COPIED_STATE_DURATION_MS = 1000;

// Shared button prop types exported for reuse in other components
export type ButtonSize = IconButtonProps["size"];
export type ButtonVariant = IconButtonProps["variant"];
export type ButtonColor = IconButtonProps["color"];

// Type for icon components that accept width/height props (e.g., Radix UI icons)
export type IconComponent = ComponentType<{ width?: string | number; height?: string | number }>;

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
	 * Optional custom icon component to show when not copied (defaults to ClipboardIcon)
	 */
	icon?: IconComponent;
	/**
	 * Size for both the custom icon and checkmark icon
	 * @default 16
	 */
	iconSize?: number;
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
	icon: IconComp,
	iconSize = 16,
	tooltipText = "Copy to Clipboard",
}) => {
	const [copied, setCopied] = useState(false);
	const [tooltipOpen, setTooltipOpen] = useState(false);
	const forceOpenRef = useRef(false);
	const { track } = useTelemetry();

	// Consolidated timer effect: Reset copied state, tooltip, and force-open flag
	useEffect(() => {
		if (copied) {
			// Schedule state updates to avoid synchronous setState in effect
			queueMicrotask(() => {
				forceOpenRef.current = true;
				setTooltipOpen(true);
			});

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

				// Track copy action
				track({
					name: "user_interaction",
					properties: {
						action: "copy_button",
						component: "CopyButton",
						value: value.length, // Track length instead of actual value for privacy
					},
				});
			},
			(err) => {
				console.error("Failed to copy to clipboard:", err);
			}
		);
	}, [value, track]);

	const handleTooltipOpenChange = useCallback((open: boolean) => {
		// Don't allow the tooltip to close if we're in the forced-open period
		if (!open && forceOpenRef.current) {
			return;
		}
		setTooltipOpen(open);
	}, []);

	// Determine which icon component to render
	const ActiveIcon = copied ? CheckIcon : (IconComp ?? ClipboardIcon);

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
				<ActiveIcon width={iconSize} height={iconSize} />
			</IconButton>
		</Tooltip>
	);
};

export default CopyButton;
