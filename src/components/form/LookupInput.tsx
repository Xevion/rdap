import {useForm} from "react-hook-form";
import type {FunctionComponent} from "react";
import {onPromise} from "@/helpers";
import type {TargetType} from "@/types";

type LookupInputProps = {
    isLoading?: boolean
    onRegistry?: (type: TargetType) => Promise<void>;
}

type LookupForm = {
    target: string;
}

const LookupInput: FunctionComponent<LookupInputProps> = ({isLoading}: LookupInputProps) => {
    const {register, handleSubmit} = useForm<LookupForm>();

    const onSubmit = (data: LookupForm) => {
        return;
    }

    return (
        <form onSubmit={onPromise(handleSubmit(onSubmit))} className="form-inline">
            <input
                className="form-control bg-zinc-800 focus:bg-zinc-700 focus:border-zinc-600 border-zinc-700 text-zinc-200"
                {...register("target", {required: true})}
                placeholder="A domain, an IP address, a TLD, an RDAP URL..."
                disabled={isLoading}
            />
            <div className="input-group-append">
                <input id="button" type="button" value="Submit" disabled={isLoading}/>
            </div>
        </form>
    )
}

export default LookupInput;