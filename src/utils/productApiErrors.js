

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

  if (typeof payload.error === "string") {

    return payload.error;
  }

  if (typeof payload.detail === "string") {

    return payload.detail;
  }

  if (Array.isArray(payload.detail) && payload.detail.length) {

    const first = payload.detail[0];

    return typeof first === "string"

      ? first

      : JSON.stringify(first);
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
