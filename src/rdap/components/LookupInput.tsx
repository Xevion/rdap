import { useForm, Controller } from "react-hook-form";
import type { FunctionComponent } from "react";
import { useState, useEffect } from "react";
import { onPromise, preventDefault } from "@/lib/utils";
import type { SimplifiedTargetType, SubmitProps, TargetType } from "@/rdap/schemas";
import { TargetTypeEnum } from "@/rdap/schemas";
import { MagnifyingGlassIcon, ReloadIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { TextField, Select, Flex, Checkbox, Text, IconButton, Badge } from "@radix-ui/themes";
import type { Maybe } from "true-myth";
import { placeholders } from "@/rdap/constants";

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
	onChange?: (target: { target: string; targetType: TargetType | null }) => void | Promise<void>;
	detectedType: Maybe<TargetType>;
};

const LookupInput: FunctionComponent<LookupInputProps> = ({
	isLoading,
	onSubmit,
	onChange,
	detectedType,
}: LookupInputProps) => {
	const { register, handleSubmit, getValues, control } = useForm<SubmitProps>({
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
	const [selected, setSelected] = useState<SimplifiedTargetType | "auto">("auto");

	/**
	 * Tracks the current input value to determine if the field is empty.
	 */
	const [inputValue, setInputValue] = useState<string>("");

	/**
	 * Tracks whether we're waiting for type detection after transitioning from empty to non-empty input.
	 * Prevents badge from flickering during initial input.
	 */
	const [showingPlaceholder, setShowingPlaceholder] = useState<boolean>(false);

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

		// Validate the value is a valid TargetType
		const result = TargetTypeEnum.safeParse(value);
		return result.success ? result.data : null;
	}

	/**
	 * Clear the placeholder flag when type detection completes.
	 * This prevents badge flickering when transitioning from empty to non-empty input.
	 */
	useEffect(() => {
		if (showingPlaceholder) {
			setShowingPlaceholder(false);
		}
	}, [detectedType]);

	return (
		<form
			className="pb-2.5"
			onSubmit={onSubmit != undefined ? onPromise(handleSubmit(onSubmit)) : preventDefault}
		>
			<Flex direction="column" gap="3">
				<label htmlFor="search" className="sr-only">
					Search
				</label>
				<Flex gap="0" style={{ position: "relative" }}>
					<TextField.Root
						id="search"
						size="3"
						placeholder={placeholders[selected]}
						disabled={isLoading}
						{...register("target", {
							required: true,
							onChange: () => {
								const targetValue = getValues("target");
								const oldIsEmpty = inputValue.trim() === "";
								const newIsEmpty = targetValue.trim() === "";

								// Transitioning from empty to non-empty - show placeholder until detection completes
								if (oldIsEmpty && !newIsEmpty) {
									setShowingPlaceholder(true);
								} else if (newIsEmpty) {
									// Input is now empty - clear placeholder
									setShowingPlaceholder(false);
								}

								setInputValue(targetValue);
								if (onChange != undefined)
									void onChange({
										target: targetValue,
										targetType: retrieveTargetType(null),
									});
							},
						})}
						style={{
							borderTopRightRadius: 0,
							borderBottomRightRadius: 0,
							border: "1px solid var(--gray-7)",
							borderRight: "none",
							boxShadow: "none",
							flex: 1,
						}}
					>
						<TextField.Slot side="left">
							<IconButton
								size="1"
								variant="ghost"
								type="submit"
								disabled={isLoading}
								tabIndex={-1}
								style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
							>
								{isLoading ? (
									<ReloadIcon className="animate-spin" width="16" height="16" />
								) : (
									<MagnifyingGlassIcon width="16" height="16" />
								)}
							</IconButton>
						</TextField.Slot>
					</TextField.Root>

					<Select.Root
						value={selected}
						onValueChange={(value) => {
							setSelected(value as SimplifiedTargetType | "auto");

							if (onChange != undefined)
								void onChange({
									target: getValues("target"),
									targetType: retrieveTargetType(value),
								});
						}}
						disabled={isLoading}
						size="3"
					>
						<Select.Trigger
							style={{
								borderTopLeftRadius: 0,
								borderBottomLeftRadius: 0,

								minWidth: "150px",
							}}
						>
							{selected == "auto" ? (
								showingPlaceholder || inputValue.trim() === "" ? (
									objectNames["auto"]
								) : detectedType.isJust ? (
									<Flex align="center" gap="2">
										<Badge color="green">Auto</Badge>
										{targetShortNames[detectedType.value]}
									</Flex>
								) : (
									<Flex align="center" gap="2">
										<Badge color="red">Auto</Badge>
										Unknown
									</Flex>
								)
							) : (
								<Flex align="center" gap="2">
									<LockClosedIcon
										width="16"
										height="16"
										style={{ color: "var(--blue-9)" }}
									/>
									{objectNames[selected]}
								</Flex>
							)}
						</Select.Trigger>

						<Select.Content position="popper">
							{Object.entries(objectNames).map(([key, value]) => (
								<Select.Item key={key} value={key}>
									<Flex
										align="center"
										justify="between"
										gap="2"
										style={{ width: "100%" }}
									>
										{value}
									</Flex>
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
				</Flex>

				<Flex pl="3" gapX="5" gapY="2" wrap="wrap">
					<Flex asChild align="center" gap="2">
						<Text as="label" size="2">
							<Controller
								name="requestJSContact"
								control={control}
								render={({ field }) => (
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							/>
							Request JSContact
						</Text>
					</Flex>
					<Flex asChild align="center" gap="2">
						<Text as="label" size="2">
							<Controller
								name="followReferral"
								control={control}
								render={({ field }) => (
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							/>
							Follow referral to registrar&apos;s RDAP record
						</Text>
					</Flex>
				</Flex>
			</Flex>
		</form>
	);
};

export default LookupInput;
