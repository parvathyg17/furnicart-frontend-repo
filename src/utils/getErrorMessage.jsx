export default function getErrorMessage(error) {

  // SIMPLE STRING

  if (typeof error === "string") {

    return error;
  }

  // DRF VALIDATION ERRORS

  if (
    typeof error === "object" &&
    error !== null
  ) {

    const messages = [];

    Object.keys(error).forEach((key) => {

      const value = error[key];

      if (Array.isArray(value)) {

        messages.push(
          `${key}: ${value.join(", ")}`
        );

      } else {

        messages.push(
          `${key}: ${value}`
        );
      }
    });

    return messages.join("\n");
  }

  return "Something went wrong";
}