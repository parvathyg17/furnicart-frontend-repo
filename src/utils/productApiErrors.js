
export function formatCheckoutValidationError(payload) {

  if (
    payload == null ||
    typeof payload !== "object"
  ) {

    return "Could not validate checkout.";
  }

  const summary =
    typeof payload.message === "string"
      ? payload.message.trim()
      : "";

  const issues = payload.line_issues;

  if (
    Array.isArray(issues) &&
    issues.length
  ) {

    const detail =
      issues
        .map(
          (row) =>
            typeof row.message === "string"
              ? row.message.trim()
              : ""
        )
        .filter(Boolean)
        .join(" ");

    if (summary && detail) {

      return `${summary} ${detail}`;
    }

    return summary || detail || formatProductApiError(payload);
  }

  return summary || formatProductApiError(payload);
}


export function formatProductApiError(payload) {

  if (
    payload == null ||
    payload === ""
  ) {

    return "Something went wrong.";
  }

  if (typeof payload === "string") {

    return payload;
  }

  if (typeof payload !== "object") {

    return String(payload);
  }

  // Cart / DRF: Response(exc.detail) is often a bare JSON array, e.g.
  // ["Maximum 10 units allowed per item."]
  if (Array.isArray(payload) && payload.length) {

    const texts = payload

      .map((item) => {

        if (typeof item === "string") {

          return item.trim();
        }

        if (
          item &&
          typeof item === "object"
        ) {

          if (typeof item.string === "string") {

            return item.string.trim();
          }

          if (typeof item.detail === "string") {

            return item.detail.trim();
          }
        }

        return "";
      })

      .filter(Boolean);

    if (texts.length > 0) {

      return texts.join(" ");
    }
  }

  if (typeof payload.error === "string") {

    return payload.error;
  }

  if (typeof payload.detail === "string") {

    return payload.detail;
  }

  if (Array.isArray(payload.detail) && payload.detail.length) {

    const first = payload.detail[0];

    if (typeof first === "string") {

      return first;
    }

    if (
      first &&
      typeof first === "object" &&
      typeof first.string === "string"
    ) {

      return first.string;
    }

    return JSON.stringify(first);
  }

  // Nested field errors: { "detail": { "quantity": ["…"] } }
  if (
    payload.detail &&
    typeof payload.detail === "object" &&
    !Array.isArray(payload.detail)
  ) {

    const nested =
      formatProductApiError(
        payload.detail,
      );

    if (
      nested &&
      nested !== "Something went wrong."
    ) {

      return nested;
    }
  }

  if (

    Array.isArray(payload.non_field_errors) &&

    payload.non_field_errors.length
  ) {

    return payload.non_field_errors.join(" ");
  }

  const parts = [];

  for (const [key, val] of Object.entries(payload)) {

    if (

      [

        "error",

        "detail",

      ].includes(key)
    ) {

      continue;
    }

    if (Array.isArray(val) && val.length) {

      parts.push(

        `${key}: ${val[0]}`
      );
    } else if (

      typeof val === "string" &&

      val.trim()
    ) {

      parts.push(

        `${key}: ${val}`
      );
    }
  }

  return parts.length

    ? parts.join(" ")

    : "Something went wrong.";
}

/**
 * Maps API payload to { fieldKey: message, _general?: string } for forms.
 */

export function mapPayloadToFormErrors(payload) {

  const next = {};

  if (

    !payload ||

    typeof payload !== "object"
  ) {

    return next;
  }

  for (const [key, val] of Object.entries(payload)) {

    if (

      [

        "error",

        "detail",

      ].includes(key)
    ) {

      continue;
    }

    if (key === "non_field_errors") {

      if (Array.isArray(val) && val.length) {

        next._general = val.join(" ");
      }

      continue;
    }

    if (Array.isArray(val) && val[0]) {

      next[key] = val[0];
    } else if (

      typeof val === "string" &&

      val.trim()
    ) {

      next[key] = val;
    }
  }

  if (!next._general) {

    const detail = payload.detail;

    if (typeof detail === "string") {

      next._general = detail;
    } else if (

      Array.isArray(detail) &&

      detail[0]
    ) {

      next._general =

        typeof detail[0] === "string"

          ? detail[0]

          : JSON.stringify(detail[0]);
    }
  }

  const fieldKeys = Object.keys(next).filter(

    (key) =>
      key !== "_general"
  );

  if (
    !next._general &&

    fieldKeys.length === 0
  ) {

    next._general = formatProductApiError(payload);
  }

  return next;
}
