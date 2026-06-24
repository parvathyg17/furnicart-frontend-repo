import {
  getProductOfferLabel,
} from "../offerBadgeUtlis";

export default function OfferBadge(
  {
    product,
    label,
    className = "",
  },
) {

  const text =
    label
    ?? getProductOfferLabel(
      product,
    );

  if (
    !text
  ) {

    return null;
  }

  return (

    <span
      className={
        className
          ? `fc-offer-badge ${className}`
          : "fc-offer-badge"
      }
    >
      {text}
    </span>
  );
}
