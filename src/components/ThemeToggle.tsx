"use client";

import { useTheme } from "next-themes";
import { IconButton } from "@radix-ui/themes";
import { MoonIcon, SunIcon, DesktopIcon } from "@radix-ui/react-icons";
import { useEffect, useState, type ReactElement } from "react";
import { useTelemetry } from "@/contexts/TelemetryContext";

type Theme = "light" | "dark" | "system";

const ICON_SIZE = 22;

const THEME_CONFIG: Record<Theme, { icon: ReactElement; next: Theme }> = {
	light: { icon: <SunIcon width={ICON_SIZE} height={ICON_SIZE} />, next: "dark" },
	dark: { icon: <MoonIcon width={ICON_SIZE} height={ICON_SIZE} />, next: "system" },
	system: { icon: <DesktopIcon width={ICON_SIZE} height={ICON_SIZE} />, next: "light" },
};

const isTheme = (value: string | undefined): value is Theme => {
	return value === "light" || value === "dark" || value === "system";
};

export const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();
	const { track } = useTelemetry();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch by only rendering after mount
	useEffect(() => {
		// Schedule state update to avoid synchronous setState in effect
		queueMicrotask(() => setMounted(true));
	}, []);

	if (!mounted) {
		return null;
	}

	const currentTheme: Theme = isTheme(theme) ? theme : "system";
	const { icon, next } = THEME_CONFIG[currentTheme];

	const toggleTheme = () => {
		// Track theme change
		track({
			name: "user_interaction",
			properties: {
				action: "theme_toggle",
				component: "ThemeToggle",
				value: next,
			},
		});

		setTheme(next);
	};

	return (
		<IconButton size="3" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
			{icon}
		</IconButton>
	);
};
