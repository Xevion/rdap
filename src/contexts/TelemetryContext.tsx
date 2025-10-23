/**
 * Telemetry context provider for PostHog integration.
 * Provides useTelemetry hook and automatic page view tracking.
 */

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useRouter } from "next/router";
import { telemetry } from "@/telemetry/client";
import type { TelemetryEvent } from "@/telemetry/events";

interface TelemetryContextValue {
	track: <E extends TelemetryEvent>(event: E) => void;
	identify: (userId: string, properties?: Record<string, unknown>) => void;
	reset: () => void;
	isEnabled: () => boolean;
}

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

interface TelemetryProviderProps {
	children: ReactNode;
}

export function TelemetryProvider({ children }: TelemetryProviderProps) {
	const router = useRouter();

	// Initialize telemetry on mount
	useEffect(() => {
		telemetry.init();
	}, []);

	// Track page views on route change
	useEffect(() => {
		const handleRouteChange = (url: string) => {
			telemetry.track({
				name: "page_view",
				properties: {
					route: url,
					referrer: document.referrer,
				},
			});
		};

		// Track initial page view
		handleRouteChange(router.asPath);

		// Subscribe to route changes
		// Note: routeChangeComplete only fires for subsequent navigations, not the initial load,
		// so the initial page view tracked above won't be duplicated
		router.events.on("routeChangeComplete", handleRouteChange);

		return () => {
			router.events.off("routeChangeComplete", handleRouteChange);
		};
	}, [router.asPath, router.events]);

	const value: TelemetryContextValue = {
		track: telemetry.track.bind(telemetry),
		identify: telemetry.identify.bind(telemetry),
		reset: telemetry.reset.bind(telemetry),
		isEnabled: telemetry.isEnabled.bind(telemetry),
	};

	return <TelemetryContext.Provider value={value}>{children}</TelemetryContext.Provider>;
}

/**
 * Hook to access telemetry client from any component
 */
export function useTelemetry(): TelemetryContextValue {
	const context = useContext(TelemetryContext);
	if (!context) {
		throw new Error("useTelemetry must be used within a TelemetryProvider");
	}
	return context;
}
