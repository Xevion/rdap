import type { SyntheticEvent } from "react";
import type { Entries } from "type-fest";

declare global {
  interface ObjectConstructor {
    entries<T extends object>(o: T): Entries<T>
  }  
}

export function truthy(value: string | null | undefined) {
  if (value == undefined) return false;
  return value.toLowerCase() == "true" || value == "1";
}

export function onPromise<T>(promise: (event: SyntheticEvent) => Promise<T>) {
  return (event: SyntheticEvent) => {
    if (promise) {
      promise(event).catch((error) => {
        console.log("Unexpected error", error);
      });
    }
  };
}

/**
 * Truncate a string dynamically to ensure maxLength is not exceeded & an ellipsis is used.
 * Behavior undefined when ellipsis exceeds {maxLength}.
 * @param input The input string
 * @param maxLength A positive number representing the maximum length the input string should be.
 * @param ellipsis A string representing what should be placed on the end when the max length is hit.
 */
export function truncated(input: string, maxLength: number, ellipsis = "...") {
  if (maxLength <= 0) return "";
  if (input.length <= maxLength) return input;
  return (
    input.substring(0, Math.max(0, maxLength - ellipsis.length)) + ellipsis
  );
}

export function preventDefault(event: SyntheticEvent | Event) {
  event.preventDefault();
}
