/**
 * Telemetry client wrapper for PostHog with type-safe event tracking.
 * Provides console logging in development/CI environments when PostHog keys are not configured.
 */

import posthog from "posthog-js";
import { env } from "@/env/client.mjs";
import type { TelemetryEvent } from "@/telemetry/events";

class TelemetryClient {
	private initialized = false;
	private enabled = false;

	/**
	 * Centralized logging method that only logs in development or when PostHog is disabled
	 */
	private log(message: string, data?: unknown): void {
		if (process.env.NODE_ENV !== "production" || !this.enabled) {
			if (data !== undefined) {
				console.log(`[Telemetry] ${message}`, data);
			} else {
				console.log(`[Telemetry] ${message}`);
			}
		}
	}

	/**
	 * Ensure the client is initialized before use
	 */
	private ensureInitialized(): void {
		if (!this.initialized) {
			this.init();
		}
	}

	/**
	 * Initialize the PostHog client if keys are available
	 */
	init(): void {
		if (this.initialized) return;

		// Only enable PostHog if both key and host are configured
		if (env.NEXT_PUBLIC_POSTHOG_KEY && env.NEXT_PUBLIC_POSTHOG_HOST) {
			posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
				api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
				loaded: (ph) => {
					// Disable in development for debugging purposes
					if (process.env.NODE_ENV === "development") {
						ph.debug();
					}
				},
				capture_pageview: false, // We'll handle page views manually
				capture_pageleave: true,
				persistence: "localStorage",
			});
			this.enabled = true;
			this.log("PostHog initialized");
		} else {
			this.enabled = false;
			this.log("PostHog not configured, console logging enabled");
		}

		this.initialized = true;
	}

	/**
	 * Track a telemetry event with type safety
	 */
	track<E extends TelemetryEvent>(event: E): void {
		this.ensureInitialized();
		this.log(event.name, event.properties);

		if (this.enabled) {
			posthog.capture(event.name, event.properties);
		}
	}

	/**
	 * Identify a user with properties
	 */
	identify(userId: string, properties?: Record<string, unknown>): void {
		this.ensureInitialized();
		this.log("identify", { userId, properties });

		if (this.enabled) {
			posthog.identify(userId, properties);
		}
	}

	/**
	 * Reset user identification (e.g., on logout)
	 */
	reset(): void {
		if (!this.initialized) return;
		this.log("reset");

		if (this.enabled) {
			posthog.reset();
		}
	}

	/**
	 * Check if telemetry is enabled
	 */
	isEnabled(): boolean {
		this.ensureInitialized();
		return this.enabled;
	}
}

/**
 * Singleton telemetry client instance
 */
export const telemetry = new TelemetryClient();
