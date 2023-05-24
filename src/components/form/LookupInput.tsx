import { useForm } from "react-hook-form";
import type { FunctionComponent } from "react";
import { onPromise, preventDefault } from "@/helpers";
import type { SubmitProps, TargetType } from "@/types";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

type LookupInputProps = {
  isLoading?: boolean;
  // When a type of registry is detected when a user changes their input, this is called.
  onRegistry?: (type: TargetType) => Promise<any>;
  // When a user hits submit, this is called.
  onSubmit?: (props: SubmitProps) => Promise<any>;
  onChange?: (target: string) => any;
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
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-zinc-400"
              aria-hidden="true"
            />
          </div>
          <input
            className="lg:py-4.5 block w-full rounded-md border border-transparent bg-zinc-700 py-2 pl-10 pr-3 text-sm placeholder-zinc-400 placeholder:translate-y-2 focus:text-zinc-200 focus:outline-none sm:text-sm md:py-3 md:text-base lg:text-lg"
            disabled={isLoading}
            placeholder="A domain, an IP address, a TLD, an RDAP URL..."
            type="search"
            {...register("target", {
              required: true,
              onChange: () => {
                if (onChange != undefined) onChange(getValues("target"));
              },
            })}
          />
        </div>
      </div>
      <div className="col p-0">
        <div className="flex flex-wrap pt-3 pb-1 text-sm">
          <div className="whitespace-nowrap">
            <input
              className="ml-2 mr-1 whitespace-nowrap text-zinc-800 accent-zinc-700"
              type="checkbox"
              {...register("requestJSContact")}
            />
            <label className="" htmlFor="requestJSContact">
              Request JSContact
            </label>
          </div>
          <div className="whitespace-nowrap">
            <input
              className="ml-2 mr-1 bg-zinc-500 text-inherit accent-zinc-700"
              type="checkbox"
              {...register("followReferral")}
            />
            <label className="" htmlFor="followReferral">
              Follow referral to registrar&apos;s RDAP record
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};

export default LookupInput;
