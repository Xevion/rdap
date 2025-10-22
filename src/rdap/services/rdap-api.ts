import type { ZodSchema } from "zod";
import { Result } from "true-myth";

/**
 * Fetch and parse RDAP data from a URL
 */
export async function getAndParse<T>(url: string, schema: ZodSchema<T>): Promise<Result<T, Error>> {
	const response = await fetch(url);

	if (response.status == 200) {
		const result = schema.safeParse(await response.json());

		if (result.success === false) {
			// flatten the errors to make them more readable and simple
			const flatErrors = result.error.flatten(function (issue) {
				const path = issue.path.map((value) => value.toString()).join(".");
				return `${path}: ${issue.message}`;
			});

			// combine them all, wrap them in a new error, and return it
			return Result.err(
				new Error(
					[
						"Could not parse the response from the registry.",
						...flatErrors.formErrors,
						...Object.values(flatErrors.fieldErrors).flat(),
					].join("\n\t")
				)
			);
		}

		return Result.ok(result.data);
	}

	switch (response.status) {
		case 302:
			return Result.err(
				new Error(
					"The registry indicated that the resource requested is available at a different location."
				)
			);
		case 400:
			return Result.err(
				new Error(
					"The registry indicated that the request was malformed or could not be processed. Check that you typed in the correct information and try again."
				)
			);
		case 403:
			return Result.err(
				new Error(
					"The registry indicated that the request was forbidden. This could be due to rate limiting, abusive behavior, or other reasons. Try again later or contact the registry for more information."
				)
			);

		case 404:
			return Result.err(
				new Error(
					"The registry indicated that the resource requested could not be found; the resource either does not exist, or is something that the registry does not track (i.e. this software queried incorrectly, which is unlikely)."
				)
			);
		case 500:
			return Result.err(
				new Error(
					"The registry indicated that an internal server error occurred. This could be due to a misconfiguration, a bug, or other reasons. Try again later or contact the registry for more information."
				)
			);
		default:
			return Result.err(
				new Error(`The registry did not return an OK status code: ${response.status}.`)
			);
	}
}
