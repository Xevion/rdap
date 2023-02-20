import React, {useEffect, useMemo, useState} from "react";
import {domainMatchPredicate, getBestURL, getType} from "@/rdap";
import type {AutonomousNumber, Domain, IpNetwork, Register, RootRegistryType, TargetType} from "@/types";
import {registryURLs} from "@/constants";
import axios from "axios";
import {AutonomousNumberSchema, DomainSchema, IpNetworkSchema, RegisterSchema, RootRegistryEnum} from "@/schema";
import {truncated} from "@/helpers";
import {ZodSchema} from "zod";

export type WarningHandler = (warning: { message: string }) => void;
type BootstrapMatcher = (value: string) => boolean;

const useLookup = (warningHandler?: WarningHandler) => {
    const [registryData, setRegistryData] = useState<Record<RootRegistryType, Register | null>>({} as Record<TargetType, Register>);
    const [error, setError] = useState<string | null>(null);
    const [target, setTarget] = useState<string>("");

    const uriType = useMemo<TargetType | 'unknown'>(function () {
        return getType(target) ?? 'unknown';
    }, [target]);

    // Fetch & load a specific registry's data into memory.
    async function loadBootstrap(type: RootRegistryType) {
        // Fetch the bootstrapping file from the registry
        const response = await axios.get(registryURLs[type]);
        if (response.status != 200)
            throw new Error(`Error: ${response.statusText}`)

        // Parse it, so we don't make any false assumptions during development & while maintaining the tool.
        const parsedRegister = RegisterSchema.safeParse(response.data);
        if (!parsedRegister.success)
            throw new Error(`Could not parse IANA bootstrap response (${type}).`)

        // Set it in state so we can use it.
        setRegistryData((prev) => ({
            ...prev,
            [type]: parsedRegister.data
        }));
    }

    function getURL(type: RootRegistryType, lookupTarget: string): string {
        const bootstrap = registryData[type];
        if (bootstrap == null) throw new Error(`Cannot acquire RDAP URL without bootstrap data for ${type} lookup.`)

        switch (type) {
            case "domain":
                for (const bootstrapItem of bootstrap.services) {
                    if (bootstrapItem[0].some(domainMatchPredicate))
                        return getBestURL(bootstrapItem[1]);
                }
                throw new Error(`No matching domain found.`)
            case "ip4":
                throw new Error(`No matching ip4 found.`)
                break;
            case "ip6":
                throw new Error(`No matching ip6 found.`)
                break;
            case "entity":
                throw new Error(`No matching entity found.`)
                break;
            case "autnum":
                throw new Error(`No matching autnum found.`)
                break;
            default:
                throw new Error("")
        }
    }

    useEffect(() => {
        const preload = async () => {
            if (uriType === 'unknown') return;
            const registryUri = RootRegistryEnum.safeParse(uriType);
            if (!registryUri.success) return;
            console.log({registryData, registryUri: registryUri.data});
            if (registryData[registryUri.data] != null) return;

            try {
                await loadBootstrap(registryUri.data);
            } catch (e) {
                if (warningHandler != undefined) {
                    const message = e instanceof Error ? `(${truncated(e.message, 15)})` : '.';
                    warningHandler({
                        message: `Failed to preload registry${message}`
                    })
                }
            }
        }

        preload().catch(console.error);
    }, [target]);

    async function getAndParse<T>(url: string, schema: ZodSchema): Promise<T | undefined> {
        const response = await axios.get(url);
        if (response.status == 200)
            return schema.parse(response.data) as T
    }

    async function submitInternal() {
        if (target == null)
            throw new Error("A target must be given in order to execute a lookup.")

        const targetType = getType(target);

        switch (targetType) {
            // Block scoped case to allow url const reuse
            case "ip4": {
                await loadBootstrap("ip4");
                const url = getURL(targetType, target);
                return getAndParse<IpNetwork>(url, IpNetworkSchema)
            }
            case "ip6": {
                await loadBootstrap("ip6");
                const url = getURL(targetType, target);
                return getAndParse<IpNetwork>(url, IpNetworkSchema);
            }
            case "domain": {
                await loadBootstrap("domain");
                const url = getURL(targetType, target);
                return getAndParse<Domain>(url, DomainSchema);
            }
            case "autnum": {
                await loadBootstrap("autnum");
                const url = getURL(targetType, target);
                return getAndParse<AutonomousNumber>(url, AutonomousNumberSchema);
            }
            case null:
                throw new Error("The type could not be detected given the target.")
            case "url":
            case "tld":
            case "registrar":
            case "json":
            default:
                throw new Error("The type detected has not been implemented.")
        }
    }

    async function submit() {
        try {
            const data = await submitInternal();
        } catch (e) {
            if (!(e instanceof Error))
                return setError("An unknown, unprocessable error has occurred.");
            return setError(e.message);
        }
    }

    return {error, setTarget, submit, currentType: uriType};
}

export default useLookup;