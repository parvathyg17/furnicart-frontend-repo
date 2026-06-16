const IMAGE_BASE = (
  import.meta.env.VITE_API_URL || ""
).replace(
  /\/$/,
  "",
);

/**
 * @param {string | null | undefined} imageUrl
 * @param {string | number | null | undefined} [cacheRevision] Appended as `?v=` / `&v=` for cache busting
 * @returns {string | null}
 */
export function resolveMediaUrl(
  imageUrl,
  cacheRevision,
) {

  if (
    !imageUrl
  ) {

    return null;
  }

  let resolved;

  if (
    imageUrl.startsWith(
      "http",
    )
  ) {

    resolved = imageUrl;
  } else {

    const path = imageUrl.startsWith(
      "/",
    )
      ? imageUrl
      : `/${imageUrl}`;

    resolved = `${IMAGE_BASE}${path}`;
  }

  if (
    cacheRevision === undefined
    ||
    cacheRevision === null
    ||
    cacheRevision === ""
  ) {

    return resolved;
  }

  const sep = resolved.includes("?") ? "&" : "?";

  return `${resolved}${sep}v=${encodeURIComponent(String(cacheRevision))}`;
}
