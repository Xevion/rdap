import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { getType, validateInputForType } from "@/rdap/utils";
import type { AutonomousNumber, Domain, IpNetwork, SubmitProps, TargetType } from "@/rdap/schemas";
import {
	AutonomousNumberSchema,
	DomainSchema,
	IpNetworkSchema,
	RootRegistryEnum,
} from "@/rdap/schemas";
import { truncated } from "@/lib/utils";
import type { ParsedGeneric } from "@/rdap/components/Generic";
import { Maybe, Result } from "true-myth";
import { loadBootstrap, getRegistry } from "@/rdap/services/registry";
import { getRegistryURL } from "@/rdap/services/url-resolver";
import { getAndParse } from "@/rdap/services/rdap-api";

export type WarningHandler = (warning: { message: string }) => void;
export type MetaParsedGeneric = {
	data: ParsedGeneric;
	url: string;
	completeTime: Date;
};

// An array of schemas to try and parse unknown JSON data with.
const schemas = [DomainSchema, AutonomousNumberSchema, IpNetworkSchema];

const useLookup = (warningHandler?: WarningHandler) => {
	const [error, setError] = useState<string | null>(null);
	const [target, setTarget] = useState<string>("");
	const [debouncedTarget] = useDebouncedValue(target, 150);
	const [uriType, setUriType] = useState<Maybe<TargetType>>(Maybe.nothing());

	// Used by a callback on LookupInput to forcibly set the type of the lookup.
	const [currentType, setTargetType] = useState<TargetType | null>(null);

	// Used to allow repeatable lookups when weird errors happen.
	const repeatableRef = useRef<string>("");

	const getTypeEasy = useCallback(async (target: string): Promise<Result<TargetType, Error>> => {
		return getType(target, getRegistry);
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

	useEffect(() => {
		const preload = async () => {
			if (uriType.isNothing) return;

			const registryUri = RootRegistryEnum.safeParse(uriType.value);
			if (!registryUri.success) return;

			try {
				await loadBootstrap(registryUri.data);
			} catch (e) {
				if (warningHandler != undefined) {
					const message = e instanceof Error ? `(${truncated(e.message, 15)})` : ".";
					warningHandler({
						message: `Failed to preload registry${message}`,
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
			const validation = await validateInputForType(target, currentType, getRegistry);
			if (validation.isErr) {
				// Show warning but proceed with user's selection
				if (warningHandler != undefined) {
					warningHandler({
						message: `Warning: ${validation.error}. Proceeding with selected type "${currentType}".`,
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

		// Prepare query parameters for RDAP requests
		const queryParams = { jsContact: requestJSContact, followReferral };

		switch (targetType) {
			// Block scoped case to allow url const reuse
			case "ip4": {
				await loadBootstrap("ip4");
				const url = getRegistryURL(targetType, target, queryParams);
				const result = await getAndParse<IpNetwork>(url, IpNetworkSchema, followReferral);
				if (result.isErr) return Result.err(result.error);
				return Result.ok({ data: result.value, url });
			}
			case "ip6": {
				await loadBootstrap("ip6");
				const url = getRegistryURL(targetType, target, queryParams);
				const result = await getAndParse<IpNetwork>(url, IpNetworkSchema, followReferral);
				if (result.isErr) return Result.err(result.error);
				return Result.ok({ data: result.value, url });
			}
			case "domain": {
				await loadBootstrap("domain");
				const url = getRegistryURL(targetType, target, queryParams);

				// HTTP
				if (url.startsWith("http://") && url != repeatableRef.current) {
					repeatableRef.current = url;
					return Result.err(
						new Error(
							"The registry this domain belongs to uses HTTP, which is not secure. " +
								"In order to prevent a cryptic error from appearing due to mixed active content, " +
								"or worse, a CORS error, this lookup has been blocked. Try again to force the lookup."
						)
					);
				}
				const result = await getAndParse<Domain>(url, DomainSchema, followReferral);
				if (result.isErr) return Result.err(result.error);

				return Result.ok({ data: result.value, url });
			}
			case "autnum": {
				await loadBootstrap("autnum");
				const url = getRegistryURL(targetType, target, queryParams);
				const result = await getAndParse<AutonomousNumber>(
					url,
					AutonomousNumberSchema,
					followReferral
				);
				if (result.isErr) return Result.err(result.error);
				return Result.ok({ data: result.value, url });
			}
			case "tld": {
				// remove the leading dot
				const value = target.startsWith(".") ? target.slice(1) : target;
				const params = new URLSearchParams();
				if (requestJSContact) params.append("jsContact", "1");
				if (followReferral) params.append("followReferral", "1");
				const queryString = params.toString();
				const baseUrl = `https://root.rdap.org/domain/${value}`;
				const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
				const result = await getAndParse<Domain>(url, DomainSchema, followReferral);
				if (result.isErr) return Result.err(result.error);
				return Result.ok({ data: result.value, url });
			}
			case "url": {
				const response = await fetch(target);

				if (response.status !== 200)
					return Result.err(
						new Error(
							`The URL provided returned a non-200 status code: ${response.status}.`
						)
					);

				const data = await response.json();

				// Try each schema until one works
				for (const schema of schemas) {
					const result = schema.safeParse(data);
					if (result.success) return Result.ok({ data: result.data, url: target });
				}

				return Result.err(new Error("No schema was able to parse the response."));
			}
			case "json": {
				try {
					const data = JSON.parse(target);
					for (const schema of schemas) {
						const result = schema.safeParse(data);
						if (result.success) return Result.ok({ data: result.data, url: "" });
					}
				} catch (e) {
					return Result.err(new Error("Invalid JSON format", { cause: e }));
				}
			}
			case "registrar": {
			}
			default:
				return Result.err(new Error("The type detected has not been implemented."));
		}
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
			} else setError(null);

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
		setTarget,
		setTargetType,
		submit,
		currentType: uriType,
		getType: getTypeEasy,
	};
};

export default useLookup;
