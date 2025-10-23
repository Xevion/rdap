import type { FunctionComponent, ReactNode } from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useTelemetry } from "@/telemetry";

type DateFormat = "relative" | "absolute";

type DateFormatContextType = {
	format: DateFormat;
	toggleFormat: () => void;
};

const DateFormatContext = createContext<DateFormatContextType | undefined>(undefined);

const STORAGE_KEY = "global-date-format-preference";

export const DateFormatProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
	const { track } = useTelemetry();

	const [format, setFormat] = useState<DateFormat>(() => {
		// Initialize from localStorage on client side
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem(STORAGE_KEY);
			return (saved as DateFormat) || "relative";
		}
		return "relative";
	});

	// Persist to localStorage whenever format changes
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem(STORAGE_KEY, format);
		}
	}, [format]);

	const toggleFormat = useCallback(() => {
		setFormat((current) => {
			const newFormat = current === "relative" ? "absolute" : "relative";

			// Track date format change
			track({
				name: "user_interaction",
				properties: {
					action: "date_format_change",
					component: "DateFormatProvider",
					value: newFormat,
				},
			});

			return newFormat;
		});
	}, [track]);

	return (
		<DateFormatContext.Provider value={{ format, toggleFormat }}>
			{children}
		</DateFormatContext.Provider>
	);
};

export const useDateFormat = (): DateFormatContextType => {
	const context = useContext(DateFormatContext);
	if (context === undefined) {
		throw new Error("useDateFormat must be used within a DateFormatProvider");
	}
	return context;
};
