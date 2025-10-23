"use client";

import { useTheme } from "next-themes";
import { IconButton } from "@radix-ui/themes";
import { MoonIcon, SunIcon, DesktopIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

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

	const toggleTheme = () => {
		if (theme === "light") {
			setTheme("dark");
		} else if (theme === "dark") {
			setTheme("system");
		} else {
			setTheme("light");
		}
	};

	const getNextTheme = () => {
		if (theme === "light") return "dark";
		if (theme === "dark") return "system";
		return "light";
	};

	const getIcon = () => {
		if (theme === "light") {
			return <SunIcon width="22" height="22" />;
		} else if (theme === "dark") {
			return <MoonIcon width="22" height="22" />;
		} else {
			return <DesktopIcon width="22" height="22" />;
		}
	};

	const nextTheme = getNextTheme();
	const themeLabel = theme === "system" ? "system" : theme === "light" ? "light" : "dark";

	return (
		<IconButton
			size="3"
			variant="ghost"
			onClick={toggleTheme}
			aria-label="Toggle theme"
			title={`Current: ${themeLabel} mode. Click to switch to ${nextTheme} mode`}
		>
			{getIcon()}
		</IconButton>
	);
};
