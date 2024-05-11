import { useForm } from "react-hook-form";
import type { FunctionComponent } from "react";
import { Fragment, useState } from "react";
import { onPromise, preventDefault } from "@/helpers";
import type { SimplifiedTargetType, SubmitProps, TargetType } from "@/types";
import {
  CheckIcon,
  ChevronUpDownIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from "@heroicons/react/20/solid";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  Transition,
} from "@headlessui/react";
import clsx from "clsx";
import type { Maybe } from "true-myth";
import { placeholders } from "@/constants";

/**
 * Props for the LookupInput component.
 */
type LookupInputProps = {
  isLoading?: boolean;
  /**
   * Callback function called when a type of registry is detected when a user changes their input.
   * @param type - The detected type of registry.
   * @returns A promise.
   */
  onRegistry?: (type: TargetType) => Promise<void>;
  /**
   * Callback function called when a user hits submit.
   * @param props - The submit props.
   * @returns A promise.
   */
  onSubmit?: (props: SubmitProps) => Promise<void>;
  /**
   * Callback function called when a user changes their input (text search) or explicitly changes the type of search.
   * @param target - The target object containing the search target and target type.
   * @returns Nothing.
   */
  onChange?: (target: {
    target: string;
    targetType: TargetType | null;
  }) => void;
  detectedType: Maybe<TargetType>;
};

const LookupInput: FunctionComponent<LookupInputProps> = ({
  isLoading,
  onSubmit,
  onChange,
  detectedType,
}: LookupInputProps) => {
  const { register, handleSubmit, getValues } = useForm<SubmitProps>({
    defaultValues: {
      target: "",
      // Not used at this time.
      followReferral: false,
      requestJSContact: false,
    },
  });

  /**
   * A mapping of available (simple) target types to their long-form human-readable names.
   */
  const objectNames: Record<SimplifiedTargetType | "auto", string> = {
    auto: "Autodetect",
    domain: "Domain",
    ip: "IP/CIDR", // IPv4/IPv6 are combined into this option
    tld: "TLD",
    autnum: "AS Number",
    entity: "Entity Handle",
    registrar: "Registrar",
    url: "URL",
    json: "JSON",
  };

  /**
   * Mapping of precise target types to their simplified short-form names.
   */
  const targetShortNames: Record<TargetType, string> = {
    domain: "Domain",
    tld: "TLD",
    ip4: "IPv4",
    ip6: "IPv6",
    autnum: "ASN",
    entity: "Entity",
    registrar: "Registrar",
    url: "URL",
    json: "JSON",
  };

  /**
   * Represents the selected value in the LookupInput component.
   */
  const [selected, setSelected] = useState<SimplifiedTargetType | "auto">(
    "auto"
  );

  /**
   * Retrieves the target type based on the provided value.
   * @param value - The value to retrieve the target type for.
   * @returns The target type as ObjectType or null.
   */
  function retrieveTargetType(value?: string | null): TargetType | null {
    // If the value is null and the selected value is null, return null.
    if (value == null) value = selected;

    // 'auto' means 'do whatever' so we return null.
    if (value == "auto") return null;

    return value as TargetType;
  }

  const searchIcon = (
    <>
      <button
        type="submit"
        className={clsx({
          "absolute inset-y-0 left-0 flex items-center pl-3": true,
          "pointer-events-none": isLoading,
        })}
      >
        {isLoading ? (
          <ArrowPathIcon
            className="h-5 w-5 animate-spin text-zinc-400"
            aria-hidden="true"
          />
        ) : (
          <MagnifyingGlassIcon
            className="h-5 w-5 text-zinc-400"
            aria-hidden="true"
          />
        )}
      </button>
    </>
  );

  const searchInput = (
    <input
      className={clsx(
        "lg:py-4.5 block w-full rounded-l-md border border-transparent",
        "bg-zinc-700 py-2 pl-10 pr-1.5 text-sm placeholder-zinc-400 placeholder:translate-y-2 focus:text-zinc-200",
        " focus:outline-none sm:text-sm md:py-3 md:text-base lg:text-lg"
      )}
      disabled={isLoading}
      placeholder={placeholders[selected]}
      type="search"
      {...register("target", {
        required: true,
        onChange: () => {
          if (onChange != undefined)
            onChange({
              target: getValues("target"),
              // dropdown target will be pulled from state anyways, so no need to provide it here
              targetType: retrieveTargetType(null),
            });
        },
      })}
    />
  );

  const dropdown = (
    <Listbox
      value={selected}
      onChange={(value) => {
        setSelected(value);

        if (onChange != undefined)
          onChange({
            target: getValues("target"),
            // we provide the value as the state will not have updated yet for this context
            targetType: retrieveTargetType(value),
          });
      }}
      disabled={isLoading}
    >
      <div className="relative">
        <ListboxButton
          className={clsx(
            "relative h-full w-full cursor-default whitespace-nowrap rounded-r-lg bg-zinc-700 py-2 pl-1 pr-10 text-right",
            "text-xs focus:outline-none focus-visible:border-indigo-500 sm:text-sm md:text-base lg:text-lg",
            "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 "
          )}
        >
          {/* Fetch special text for 'auto' mode, otherwise just use the options. */}
          <span className="block">
            {selected == "auto" ? (
              // If the detected type was provided, then notate which in parentheses. Compact object naming might be better in the future.
              detectedType.isJust ? (
                <>Auto (<span className="animate-pulse">{targetShortNames[detectedType.value]}</span>)</>
              ) : (
                objectNames["auto"]
              )
            ) : (
              <>
                <LockClosedIcon
                  className="mr-2.5 mb-1 inline h-4 w-4 animate-pulse text-zinc-500"
                  aria-hidden
                />
                {objectNames[selected]}
              </>
            )}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-zinc-200"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions
            className={clsx(
              "scrollbar-thin absolute right-0 mt-1 max-h-60 min-w-full overflow-auto rounded-md bg-zinc-700 py-1",
              "text-zinc-200 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
            )}
          >
            {Object.entries(objectNames).map(([key, value]) => (
              <ListboxOption
                key={key}
                className={({ focus }) =>
                  clsx(
                    "relative cursor-default select-none py-2 pl-10 pr-4",
                    focus ? "bg-zinc-800 text-zinc-300" : null
                  )
                }
                value={key}
              >
                {({ selected }) => (
                  <>
                    <span
                      className={clsx(
                        "block whitespace-nowrap text-right text-xs md:text-sm lg:text-base",
                        selected ? "font-medium" : null
                      )}
                    >
                      {value}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("TODO: Show Help Explanation");
                        }}
                        className="absolute inset-y-0 left-0 flex items-center pl-4 text-lg font-bold opacity-20 hover:animate-pulse"
                      >
                        ?
                      </button>
                    )}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  );

  return (
    <form
      className="pb-3"
      onSubmit={
        onSubmit != undefined
          ? onPromise(handleSubmit(onSubmit))
          : preventDefault
      }
    >
      <div className="col">
        <label htmlFor="search" className="sr-only">
          Search
        </label>
        <div className="relative flex">
          {searchIcon}
          {searchInput}
          {dropdown}
        </div>
      </div>
      <div className="col">
        <div className="flex flex-wrap pt-3 pb-1 text-sm">
          <div className="whitespace-nowrap">
            <input
              className="ml-2 mr-1 whitespace-nowrap text-zinc-800 accent-blue-700"
              type="checkbox"
              {...register("requestJSContact")}
            />
            <label className="text-zinc-300" htmlFor="requestJSContact">
              Request JSContact
            </label>
          </div>
          <div className="whitespace-nowrap">
            <input
              className="ml-2 mr-1 bg-zinc-500 text-inherit accent-blue-700"
              type="checkbox"
              {...register("followReferral")}
            />
            <label className="text-zinc-300" htmlFor="followReferral">
              Follow referral to registrar&apos;s RDAP record
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};

export default LookupInput;
