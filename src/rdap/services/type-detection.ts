import type { Register, RootRegistryType, TargetType } from "@/rdap/schemas";
import { getType, validateInputForType } from "@/rdap/utils";
import type { Result } from "true-myth";
import { truncated } from "@/lib/utils";

/**
 * Detect the target type for a given input string.
 *
 * This is a wrapper around the `getType` utility function that provides
 * a consistent interface for type detection in the application.
 *
 * @param target - The input string to detect the type for
 * @param getRegistry - Function to fetch registry data
 * @returns A Result containing the detected TargetType or an error
 */
export async function detectTargetType(
	target: string,
	getRegistry: (type: RootRegistryType) => Promise<Register>
): Promise<Result<TargetType, Error>> {
	return getType(target, getRegistry);
}

/**
 * Validate that a given input matches the expected target type.
 *
 * This is a wrapper around the `validateInputForType` utility function.
 * Used to warn users when their explicit type selection doesn't match the input format.
 *
 * @param target - The input string to validate
 * @param targetType - The expected target type
 * @param getRegistry - Function to fetch registry data
 * @returns A Result containing true if valid, or an error message if invalid
 */
export async function validateTargetType(
	target: string,
	targetType: TargetType,
	getRegistry: (type: RootRegistryType) => Promise<Register>
): Promise<Result<true, string>> {
	return validateInputForType(target, targetType, getRegistry);
}

/**
 * Generate a warning message for type validation failures.
 *
 * @param validationError - The validation error message
 * @param selectedType - The type that was selected by the user
 * @returns A formatted warning message
 */
export function generateValidationWarning(
	validationError: string,
	selectedType: TargetType
): string {
	return `Warning: ${validationError}. Proceeding with selected type "${selectedType}".`;
}

/**
 * Generate a warning message for bootstrap loading failures.
 *
 * @param error - The error that occurred
 * @returns A formatted warning message
 */
export function generateBootstrapWarning(error: unknown): string {
	const message = error instanceof Error ? `(${truncated(error.message, 15)})` : ".";
	return `Failed to preload registry${message}`;
}
