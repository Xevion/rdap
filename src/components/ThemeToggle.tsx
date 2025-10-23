"use client";

import { useTheme } from "next-themes";
import { IconButton } from "@radix-ui/themes";
import { MoonIcon, SunIcon, DesktopIcon } from "@radix-ui/react-icons";
import { useEffect, useState, type ReactElement } from "react";

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
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch by only rendering after mount
	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const currentTheme: Theme = isTheme(theme) ? theme : "system";
	const { icon, next } = THEME_CONFIG[currentTheme];

	const toggleTheme = () => {
		setTheme(next);
	};

	return (
		<IconButton size="3" variant="ghost" onClick={toggleTheme} aria-label="Toggle theme">
			{icon}
		</IconButton>
	);
};
