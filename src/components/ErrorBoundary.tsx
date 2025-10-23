/**
 * Error boundary component that catches React errors and tracks them via telemetry.
 */

import type { ReactNode, ErrorInfo } from "react";
import { Component } from "react";
import { Box, Flex, Heading, Text, Button } from "@radix-ui/themes";
import { telemetry } from "@/telemetry/client";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: (error: Error) => ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// Track the error via telemetry
		telemetry.track({
			name: "error",
			properties: {
				errorType: "runtime_error",
				message: error.message,
				stack: error.stack,
				context: {
					componentStack: errorInfo.componentStack,
					route: typeof window !== "undefined" ? window.location.pathname : "unknown",
				},
			},
		});

		// Log to console for debugging
		console.error("ErrorBoundary caught an error:", error, errorInfo);
	}

	render() {
		if (this.state.hasError && this.state.error) {
			// If custom fallback is provided, use it
			if (this.props.fallback) {
				return this.props.fallback(this.state.error);
			}

			// Default fallback UI using Radix components
			return (
				<Flex direction="column" align="center" justify="center" p="9" gap="4">
					<Box>
						<Heading size="6" align="center" mb="2">
							Something went wrong
						</Heading>
						<Text align="center" color="gray">
							{this.state.error.message}
						</Text>
					</Box>
					<Flex gap="3">
						<Button
							variant="soft"
							onClick={() => {
								this.setState({ hasError: false, error: null });
							}}
						>
							Try Again
						</Button>
						<Button
							onClick={() => {
								window.location.reload();
							}}
						>
							Reload Page
						</Button>
					</Flex>
				</Flex>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
