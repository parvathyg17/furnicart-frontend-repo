import { formatProductApiError } from "./productApiErrors.js";

export default function getErrorMessage(error) {
  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    return formatProductApiError(error);
  }

  return "Something went wrong";
}
