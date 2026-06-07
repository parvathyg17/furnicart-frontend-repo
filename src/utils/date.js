/**
 * @param {string | null | undefined} iso
 * @returns {string}
 */
export function formatDateShort(
  iso,
) {

  if (
    !iso
  ) {

    return "—";
  }

  const d = new Date(
    iso,
  );

  if (
    Number.isNaN(
      d.getTime(),
    )
  ) {

    return "—";
  }

  return d.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}
