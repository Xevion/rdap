/**
 * Telemetry module exports
 */

export { telemetry } from "@/telemetry/client";
export { useTelemetry } from "@/contexts/TelemetryContext";
export type {
	TelemetryEvent,
	PageViewEvent,
	RdapQueryEvent,
	UserInteractionEvent,
	ErrorEvent,
	EventProperties,
} from "@/telemetry/events";
