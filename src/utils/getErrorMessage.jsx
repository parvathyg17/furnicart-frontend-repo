import {
  formatProductApiError,
} from "./productApiErrors.js";

/**
 * Normalizes API / Redux rejection payloads for toasts and inline messages.
 * Uses the same rules as catalog product errors: string `error` / `detail`,
 * DRF field errors, and ignores noise like `success: false` when `error` is set.
 */
export default function getErrorMessage(error) {

  if (typeof error === "string") {

    return error;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {

    return formatProductApiError(error);
  }

  return "Something went wrong";
}