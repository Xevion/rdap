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
import { Maybe, Result } from "true-myth";

export type WarningHandler = (warning: { message: string }) => void;

const useLookup = (warningHandler?: WarningHandler) => {
  /**
   * A reference to the registry data, which is used to cache the registry data in memory.
   * This uses TargetType as the key, meaning v4/v6 IP/CIDR lookups are differentiated.
   */
  const registryDataRef = useRef<Record<RootRegistryType, Register | null>>(
    {}  as Record<RootRegistryType, Register>
  );

  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<string>("");
  // Used by a callback on LookupInput to forcibly set the type of the lookup.
  const [currentType, setTargetType] = useState<TargetType | null>(null);

  // Used to allow repeatable lookups when weird errors happen.
  const repeatableRef = useRef<string>("");

  /** */
  const uriType = useMemo<Maybe<TargetType>>(
    function () {
      if (currentType != null) return Maybe.just(currentType);
      return getType(target).mapOr(
        Maybe.nothing(),
        (type) => Maybe.just(type)
      );
    },
    [target, currentType]
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
            // min length of 1 is validated in zod schema
            url = getBestURL(bootstrapItem[1] as [string, ...string[]]);
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
      if (uriType.isNothing) return;

      const registryUri = RootRegistryEnum.safeParse(uriType.value);
      if (!registryUri.success) return;

      console.log({
        uriType: uriType.value,
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
  }, [target, uriType, warningHandler]);

  async function getAndParse<T>(
    url: string,
    schema: ZodSchema
  ): Promise<Result<T, Error>> {
    const response = await fetch(url);

    if (response.status == 200) {
      const result = schema.safeParse(await response.json());

      if (result.success === false) {
        // flatten the errors to make them more readable and simple
        const flatErrors = result.error.flatten(function (issue) {
          const path = issue.path.map((value => value.toString())).join('.');
          return `${path}: ${issue.message}`;
        });

        console.log(flatErrors);

        // combine them all, wrap them in a new error, and return it
        return Result.err(new Error([
          "Could not parse the response from the registry.",
          ...flatErrors.formErrors,
          ...Object.values(flatErrors.fieldErrors).flat(),
        ].join('\n\t')));
      }

      return Result.ok(result.data);
    }

    return Result.err(
      new Error(
        `The registry did not return an OK status code: ${response.status}.`
      )
    );
  }

  async function submitInternal(target: string): Promise<Result<ParsedGeneric, Error>> {
    if (target == null || target.length == 0)
      return Result.err(
        new Error("A target must be given in order to execute a lookup.")
      );

    const targetType = getType(target);

    if (targetType.isErr) {
      return Result.err(
        new Error("Unable to determine type, unable to send query", {
          cause: targetType.error,
        })
      );
    }

    switch (targetType.value) {
      // Block scoped case to allow url const reuse
      case "ip4": {
        await loadBootstrap("ip4");
        const url = getRegistryURL(targetType.value, target);
        const result = await getAndParse<IpNetwork>(url, IpNetworkSchema);
        if (result.isErr)
          return Result.err(result.error);
        return Result.ok(result.value);
      }
      case "ip6": {
        await loadBootstrap("ip6");
        const url = getRegistryURL(targetType.value, target);
        const result = await getAndParse<IpNetwork>(url, IpNetworkSchema);
        if (result.isErr)
          return Result.err(result.error);
        return Result.ok(result.value);
      }
      case "domain": {
        await loadBootstrap("domain");
        const url = getRegistryURL(targetType.value, target);

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
        const result = await getAndParse<Domain>(url, DomainSchema);
        if (result.isErr)
          return Result.err(result.error);

        return Result.ok(result.value);
      }
      case "autnum": {
        await loadBootstrap("autnum");
        const url = getRegistryURL(targetType.value, target);
        const result = await getAndParse<AutonomousNumber>(
          url,
          AutonomousNumberSchema
        );
        if (result.isErr)
          return Result.err(result.error);
        return Result.ok(result.value);
      }
      case "url":
      case "tld":
      case "registrar":
      case "json":
      default:
        return Result.err(
          new Error("The type detected has not been implemented.")
        );
    }
  }

  async function submit({
    target,
  }: SubmitProps): Promise<Maybe<ParsedGeneric>> {
    try {
      // target is already set in state, but it's also provided by the form callback, so we'll use it.
      const response = await submitInternal(target);

      if (response.isErr) {
        setError(response.error.message);
        console.error(response.error);
      }
      else setError(null);

      return response.isOk ? Maybe.just(response.value) : Maybe.nothing();
    } catch (e) {
      if (!(e instanceof Error))
        setError("An unknown, unprocessable error has occurred.");
      else
        setError(e.message);
      console.error(e);
      return Maybe.nothing();
    }
  }

  return { error, setTarget, setTargetType, submit, currentType: uriType };
};

export default useLookup;
