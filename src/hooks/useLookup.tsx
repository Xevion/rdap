import { useEffect, useMemo, useRef, useState } from "react";
import { domainMatchPredicate, getBestURL, getType } from "@/rdap";
import type {
  AutonomousNumber,
  Domain,
  IpNetwork,
  Register,
  RootRegistryType,
  SubmitProps,
  TargetType,
} from "@/types";
import { registryURLs } from "@/constants";
import {
  AutonomousNumberSchema,
  DomainSchema,
  IpNetworkSchema,
  RegisterSchema,
  RootRegistryEnum,
} from "@/schema";
import { truncated } from "@/helpers";
import type { ZodSchema } from "zod";
import type { ParsedGeneric } from "@/components/lookup/Generic";

export type WarningHandler = (warning: { message: string }) => void;

const useLookup = (warningHandler?: WarningHandler) => {
  const registryDataRef = useRef<Record<RootRegistryType, Register | null>>(
    {} as Record<TargetType, Register>
  );
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<string>("");

  // Used to allow repeatable lookups when weird errors happen.
  const repeatableRef = useRef<string>("");

  const uriType = useMemo<TargetType | "unknown">(
    function () {
      return getType(target).unwrapOr("unknown");
    },
    [target]
  );

  // Fetch & load a specific registry's data into memory.
  async function loadBootstrap(type: RootRegistryType, force = false) {
    // Early preload exit condition
    if (registryDataRef.current[type] != null && !force) return;

    // Fetch the bootstrapping file from the registry
    const response = await fetch(registryURLs[type]);
    if (response.status != 200)
      throw new Error(`Error: ${response.statusText}`);

    // Parse it, so we don't make any false assumptions during development & while maintaining the tool.
    const parsedRegister = RegisterSchema.safeParse(await response.json());
    if (!parsedRegister.success)
      throw new Error(
        `Could not parse IANA bootstrap response (type: ${type}).`
      );

    // Set it in state so we can use it.
    registryDataRef.current = {
      ...registryDataRef.current,
      [type]: parsedRegister.data,
    };
  }

  function getRegistryURL(
    type: RootRegistryType,
    lookupTarget: string
  ): string {
    const bootstrap = registryDataRef.current[type];
    if (bootstrap == null)
      throw new Error(
        `Cannot acquire RDAP URL without bootstrap data for ${type} lookup.`
      );

    let url: string | null = null;

    typeSwitch: switch (type) {
      case "domain":
        for (const bootstrapItem of bootstrap.services) {
          if (bootstrapItem[0].some(domainMatchPredicate(lookupTarget))) {
            url = getBestURL(bootstrapItem[1]);
            break typeSwitch;
          }
        }
        throw new Error(`No matching domain found.`);
      case "ip4":
        throw new Error(`No matching ip4 found.`);
      case "ip6":
        throw new Error(`No matching ip6 found.`);
      case "entity":
        throw new Error(`No matching entity found.`);
      case "autnum":
        throw new Error(`No matching autnum found.`);
      default:
        throw new Error("Invalid lookup target provided.");
    }

    if (url == null) throw new Error("No lookup target was resolved.");

    return `${url}${type}/${lookupTarget}`;
  }

  useEffect(() => {
    const preload = async () => {
      if (uriType === "unknown") return;
      const registryUri = RootRegistryEnum.safeParse(uriType);
      if (!registryUri.success) return;
      console.log({
        registryData: registryDataRef.current,
        registryUri: registryUri.data,
      });
      if (registryDataRef.current[registryUri.data] != null) return;

      try {
        await loadBootstrap(registryUri.data);
      } catch (e) {
        if (warningHandler != undefined) {
          const message =
            e instanceof Error ? `(${truncated(e.message, 15)})` : ".";
          warningHandler({
            message: `Failed to preload registry${message}`,
          });
        }
      }
    };

    preload().catch(console.error);
  }, [target]);

  async function getAndParse<T>(
    url: string,
    schema: ZodSchema
  ): Promise<T | undefined> {
    const response = await fetch(url);
    if (response.status == 200) return schema.parse(await response.json()) as T;
  }

  async function submitInternal(): Promise<ParsedGeneric | undefined> {
    if (target == null || target.length == 0)
      throw new Error("A target must be given in order to execute a lookup.");

    const targetType = getType(target);

    if (targetType.isNothing) {
      throw new Error(
        `The type could not be detected given the target (${JSON.stringify(
          target
        )}).`
      );
    }

    switch (targetType.value) {
      // Block scoped case to allow url const reuse
      case "ip4": {
        await loadBootstrap("ip4");
        const url = getRegistryURL(targetType.value, target);
        return await getAndParse<IpNetwork>(url, IpNetworkSchema);
      }
      case "ip6": {
        await loadBootstrap("ip6");
        const url = getRegistryURL(targetType.value, target);
        return await getAndParse<IpNetwork>(url, IpNetworkSchema);
      }
      case "domain": {
        await loadBootstrap("domain");
        const url = getRegistryURL(targetType.value, target);

        if (url.startsWith("http://") && url != repeatableRef.current) {
          repeatableRef.current = url;
          throw new Error(
            "The registry this domain belongs to uses HTTP, which is not secure. " +
              "In order to prevent a cryptic error from appearing due to mixed active content, " +
              "or worse, a CORS error, this lookup has been blocked. Try again to force the lookup."
          );
        }
        return await getAndParse<Domain>(url, DomainSchema);
      }
      case "autnum": {
        await loadBootstrap("autnum");
        const url = getRegistryURL(targetType.value, target);
        return await getAndParse<AutonomousNumber>(url, AutonomousNumberSchema);
      }
      case "url":
      case "tld":
      case "registrar":
      case "json":
      default:
        throw new Error("The type detected has not been implemented.");
    }
  }

  async function submit({
    target,
  }: SubmitProps): Promise<ParsedGeneric | undefined> {
    try {
      const response = await submitInternal();
      if (response == undefined)
        throw new Error("Internal submission failed to yield any data.");

      setError(null);
      return response;
    } catch (e) {
      if (!(e instanceof Error))
        setError("An unknown, unprocessable error has occurred.");
      setError((e as Error).message);
    }
  }

  return { error, setTarget, submit, currentType: uriType };
};

export default useLookup;
