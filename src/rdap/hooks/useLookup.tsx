import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import type { SubmitProps, TargetType } from "@/rdap/schemas";
import { RootRegistryEnum } from "@/rdap/schemas";
import type { ParsedGeneric } from "@/rdap/components/RdapObjectRouter";
import { Maybe, Result } from "true-myth";
import { loadBootstrap, getRegistry } from "@/rdap/services/registry";
import {
	detectTargetType,
	validateTargetType,
	generateValidationWarning,
	generateBootstrapWarning,
} from "@/rdap/services/type-detection";
import { executeRdapQuery, HttpSecurityError } from "@/rdap/services/query";
import { useTelemetry } from "@/contexts/TelemetryContext";
import { validateDomainTld, type TldValidationResult } from "@/rdap/services/tld-validation";

export type WarningHandler = (warning: { message: string }) => void;
export type UrlUpdateHandler = (target: string, manuallySelectedType: TargetType | null) => void;
export type MetaParsedGeneric = {
	data: ParsedGeneric;
	url: string;
	completeTime: Date;
};

const useLookup = (warningHandler?: WarningHandler, urlUpdateHandler?: UrlUpdateHandler) => {
	const [error, setError] = useState<string | null>(null);
	const [target, setTarget] = useState<string>("");
	const [debouncedTarget] = useDebouncedValue(target, 75);
	const [uriType, setUriType] = useState<Maybe<TargetType>>(Maybe.nothing());

	// Used by a callback on LookupInput to forcibly set the type of the lookup.
	const [currentType, setTargetType] = useState<TargetType | null>(null);

	// TLD validation state for real-time warnings
	const [tldValidation, setTldValidation] = useState<TldValidationResult | null>(null);

	// Used to allow repeatable lookups when weird errors happen.
	const repeatableRef = useRef<string>("");

	const { track } = useTelemetry();

	const getTypeEasy = useCallback(async (target: string): Promise<Result<TargetType, Error>> => {
		return detectTargetType(target, getRegistry);
	}, []);

	useEffect(() => {
		const detectType = async () => {
			if (currentType != null || debouncedTarget.length === 0) return;

			const detectedType = await getTypeEasy(debouncedTarget);
			if (detectedType.isOk) {
				setUriType(Maybe.just(detectedType.value));
			} else {
				setUriType(Maybe.nothing());
			}
		};

		detectType().catch(console.error);
	}, [debouncedTarget, currentType, getTypeEasy]);

	// Validate TLD in real-time for domain inputs
	useEffect(() => {
		const validateTld = async () => {
			// Clear validation when input is empty
			if (debouncedTarget.length === 0) {
				setTldValidation(null);
				return;
			}

			// Only validate domains
			const isDomain =
				currentType === "domain" ||
				(currentType === null && uriType.mapOr(false, (t) => t === "domain"));

			if (!isDomain) {
				setTldValidation(null);
				return;
			}

			// Perform validation
			const result = await validateDomainTld(debouncedTarget);
			setTldValidation(result);

			// Track telemetry for warnings/errors
			if (result.type !== "valid") {
				track({
					name: "user_interaction",
					properties: {
						action: "tld_warning_shown",
						component: "LookupInput",
						value: result.type,
					},
				});
			}
		};

		validateTld().catch(console.error);
	}, [debouncedTarget, currentType, uriType, track]);

	useEffect(() => {
		const preload = async () => {
			if (uriType.isNothing) return;

			const registryUri = RootRegistryEnum.safeParse(uriType.value);
			if (!registryUri.success) return;

			try {
				await loadBootstrap(registryUri.data);
			} catch (e) {
				if (warningHandler != undefined) {
					warningHandler({
						message: generateBootstrapWarning(e),
					});
				}
			}
		};

		preload().catch(console.error);
	}, [uriType, warningHandler]);

	async function submitInternal(
		target: string,
		requestJSContact: boolean,
		followReferral: boolean
	): Promise<Result<{ data: ParsedGeneric; url: string }, Error>> {
		if (target == null || target.length == 0)
			return Result.err(new Error("A target must be given in order to execute a lookup."));

		let targetType: TargetType;

		if (currentType != null) {
			// User has explicitly selected a type
			targetType = currentType;

			// Validate the input matches the selected type
			const validation = await validateTargetType(target, currentType, getRegistry);
			if (validation.isErr) {
				// Show warning but proceed with user's selection
				if (warningHandler != undefined) {
					warningHandler({
						message: generateValidationWarning(validation.error, currentType),
					});
				}
			}
		} else {
			// Autodetect mode
			const detectedType = await getTypeEasy(target);

			if (detectedType.isErr) {
				return Result.err(
					new Error("Unable to determine type, unable to send query", {
						cause: detectedType.error,
					})
				);
			}

			targetType = detectedType.value;
		}

		// Track query start
		const startTime = performance.now();

		// Execute the RDAP query using the extracted service
		const result = await executeRdapQuery(target, targetType, {
			requestJSContact,
			followReferral,
			repeatableUrl: repeatableRef.current,
		});

		// Calculate duration
		const duration = performance.now() - startTime;

		// Track query result
		if (result.isOk) {
			track({
				name: "rdap_query",
				properties: {
					targetType,
					success: true,
					duration,
				},
			});
		} else {
			// Determine error type
			let errorType = "unknown_error";
			if (result.error instanceof HttpSecurityError) {
				errorType = "http_security_error";
			} else if (result.error.message.includes("network")) {
				errorType = "network_error";
			} else if (result.error.message.includes("validation")) {
				errorType = "validation_error";
			}

			track({
				name: "rdap_query",
				properties: {
					targetType,
					target,
					success: false,
					errorType,
					duration,
				},
			});

			// Also track detailed error
			track({
				name: "error",
				properties: {
					errorType: "rdap_query_error",
					message: result.error.message,
					stack: result.error.stack,
					context: {
						target,
						targetType,
					},
				},
			});
		}

		// Update repeatable ref if we got an HTTP security error for domain lookups
		if (result.isErr && result.error instanceof HttpSecurityError) {
			repeatableRef.current = result.error.url;
		}

		return result;
	}

	async function submit({
		target,
		requestJSContact,
		followReferral,
	}: SubmitProps): Promise<Maybe<MetaParsedGeneric>> {
		try {
			// target is already set in state, but it's also provided by the form callback, so we'll use it.
			const response = await submitInternal(target, requestJSContact, followReferral);

			if (response.isErr) {
				setError(response.error.message);
				console.error(response.error);
			} else {
				setError(null);

				// Update URL after successful query
				// currentType is non-null only when user manually selected a type
				if (urlUpdateHandler) {
					urlUpdateHandler(target, currentType);
				}
			}

			return response.isOk
				? Maybe.just({
						data: response.value.data,
						url: response.value.url,
						completeTime: new Date(),
					})
				: Maybe.nothing();
		} catch (e) {
			if (!(e instanceof Error)) setError("An unknown, unprocessable error has occurred.");
			else setError(e.message);
			console.error(e);
			return Maybe.nothing();
		}
	}

	return {
		error,
		target,
		setTarget,
		setTargetType,
		submit,
		currentType: uriType,
		manualType: currentType,
		getType: getTypeEasy,
		tldValidation,
	};
};

export default useLookup;
