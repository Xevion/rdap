"use client";

import { useTheme } from "next-themes";
import { IconButton } from "@radix-ui/themes";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
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
		setTheme(theme === "light" ? "dark" : "light");
	};

	return (
		<IconButton
			size="3"
			variant="ghost"
			onClick={toggleTheme}
			aria-label="Toggle theme"
			title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
		>
			{theme === "light" ? (
				<MoonIcon width="18" height="18" />
			) : (
				<SunIcon width="18" height="18" />
			)}
		</IconButton>
	);
};
