/**
 * Type-safe telemetry event system using discriminated unions.
 * All events must have a 'name' discriminator property.
 */

import type { TargetType } from "@/rdap/schemas";

/**
 * Page view tracking event
 */
export type PageViewEvent = {
	name: "page_view";
	properties: {
		route: string;
		referrer?: string;
		duration?: number;
	};
};

/**
 * RDAP query tracking event
 */
export type RdapQueryEvent = {
	name: "rdap_query";
	properties: {
		targetType: TargetType;
		target?: string;
		success: boolean;
		errorType?: string;
		duration?: number;
	};
};

/**
 * User interaction tracking event
 */
export type UserInteractionEvent = {
	name: "user_interaction";
	properties: {
		action:
			| "theme_toggle"
			| "date_format_change"
			| "copy_button"
			| "link_click"
			| "expand_section"
			| "collapse_section"
			| string;
		component?: string;
		value?: string | number | boolean;
	};
};

/**
 * Error tracking event
 */
export type ErrorEvent = {
	name: "error";
	properties: {
		errorType:
			| "rdap_query_error"
			| "network_error"
			| "validation_error"
			| "runtime_error"
			| string;
		message: string;
		stack?: string;
		context?: Record<string, unknown>;
	};
};

/**
 * Discriminated union of all possible events
 */
export type TelemetryEvent = PageViewEvent | RdapQueryEvent | UserInteractionEvent | ErrorEvent;

/**
 * Helper type to extract event properties by event name
 */
export type EventProperties<T extends TelemetryEvent["name"]> = Extract<
	TelemetryEvent,
	{ name: T }
>["properties"];

/**
 * Type guard to ensure an event conforms to the TelemetryEvent schema
 */
export function isValidEvent(event: unknown): event is TelemetryEvent {
	if (!event || typeof event !== "object") return false;
	const e = event as Partial<TelemetryEvent>;
	return typeof e.name === "string" && typeof e.properties === "object" && e.properties !== null;
}
