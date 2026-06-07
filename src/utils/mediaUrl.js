const IMAGE_BASE = (
  import.meta.env.VITE_API_URL || ""
).replace(
  /\/$/,
  "",
);

/**
 * @param {string | null | undefined} imageUrl
 * @returns {string | null}
 */
export function resolveMediaUrl(
  imageUrl,
) {

  if (
    !imageUrl
  ) {

    return null;
  }

  if (
    imageUrl.startsWith(
      "http",
    )
  ) {

    return imageUrl;
  }

  const path = imageUrl.startsWith(
    "/",
  )
    ? imageUrl
    : `/${imageUrl}`;

  return `${IMAGE_BASE}${path}`;
}
