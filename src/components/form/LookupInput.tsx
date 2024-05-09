import { useForm } from "react-hook-form";
import type { FunctionComponent } from "react";
import { Fragment, useState } from "react";
import { onPromise, preventDefault } from "@/helpers";
import type { SubmitProps, TargetType } from "@/types";
import type { ObjectType } from "@/types";
import {
  CheckIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";

type LookupInputProps = {
  isLoading?: boolean;
  // When a type of registry is detected when a user changes their input, this is called.
  onRegistry?: (type: TargetType) => Promise<any>;
  // When a user hits submit, this is called.
  onSubmit?: (props: SubmitProps) => Promise<any>;
  onChange?: (target: { target: string; targetType: ObjectType | null }) => any;
};

const LookupInput: FunctionComponent<LookupInputProps> = ({
  isLoading,
  onSubmit,
  onChange,
}: LookupInputProps) => {
  const { register, handleSubmit, getValues } = useForm<SubmitProps>({
    defaultValues: {
      target: "",
      followReferral: false,
      requestJSContact: false,
    },
  });

  const options: Record<ObjectType | "auto", string> = {
    auto: "Autodetect",
    domain: "Domain",
    ip: "IP/CIDR",
    tld: "TLD",
    autnum: "AS Number",
    entity: "Entity Handle",
    registrar: "Registrar",
    url: "URL",
    json: "JSON",
  };

  const [selected, setSelected] = useState<ObjectType | "auto">("auto");

  function getAutoTargetText(): string {
    return "Autodetect";
  }

  /*
   * Returns the type of object that the user has selected. Handles the extra "auto" option like null.
   * @param value The value of the select element.
   */
  function getTargetType(value?: string | null): ObjectType | null {
    // Pull the value from the select element if it's not provided (useful for eventing values).
    if (value == null) value = selected;

    if (value == "auto" || value == null) return null;
    else return value as ObjectType;
  }

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
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-zinc-400"
              aria-hidden="true"
            />
          </div>
          <input
            className={clsx(
              "lg:py-4.5 custom-select block w-full rounded-l-md border border-transparent",
              "bg-zinc-700 py-2 pl-10 pr-3 text-sm placeholder-zinc-400 placeholder:translate-y-2 focus:text-zinc-200",
              " focus:outline-none sm:text-sm md:py-3 md:text-base lg:text-lg"
            )}
            disabled={isLoading}
            placeholder="A domain, an IP address, a TLD, an RDAP URL..."
            type="search"
            {...register("target", {
              required: true,
              onChange: () => {
                if (onChange != undefined)
                  onChange({
                    target: getValues("target"),
                    targetType: getTargetType(),
                  });
              },
            })}
          ></input>
          <Listbox
            value={selected}
            onChange={(value) => {
              setSelected(value);

              if (onChange != undefined)
                onChange({
                  target: getValues("target"),
                  targetType: getTargetType(value),
                });
            }}
            disabled={isLoading}
          >
            <div className="relative md:min-w-[10rem]">
              <Listbox.Button
                className={clsx(
                  "relative h-full w-full cursor-default rounded-r-lg bg-zinc-700 py-2 pl-3 pr-10",
                  "text-left focus:outline-none focus-visible:border-indigo-500 sm:text-sm",
                  "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 "
                )}
              >
                {/* Fetch special text for 'auto' mode, otherwise just use the options. */}
                <span className="block">
                  {selected == "auto" ? getAutoTargetText() : options[selected]}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-zinc-200"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options
                  className={clsx(
                    "scrollbar-thin absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-zinc-700 py-1",
                    "text-zinc-200 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                  )}
                >
                  {Object.entries(options).map(([key, value]) => (
                    <Listbox.Option
                      key={key}
                      className={({ active }) =>
                        clsx(
                          "relative cursor-default select-none py-2 pl-10 pr-4",
                          active ? "bg-zinc-800 text-zinc-300" : null
                        )
                      }
                      value={key}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={clsx(
                              "block",
                              selected ? "font-medium" : null
                            )}
                          >
                            {value}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-500">
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
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
