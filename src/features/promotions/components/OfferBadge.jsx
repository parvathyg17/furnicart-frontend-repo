import { formatMoney } from "../../../utils/currency.js";

import { getProductOfferLabel, resolveVariantPrices } from "../offerBadgeUtlis";

export default function OfferBadge({ product, label, className = "" }) {
  const text = label ?? getProductOfferLabel(product);

  if (!text) {
    return null;
  }

  return (
    <span
      className={className ? `fc-offer-badge ${className}` : "fc-offer-badge"}
    >
      {text}
    </span>
  );
}

export function ProductPriceDisplay({
  variant,
  product,
  className = "",
  priceClassName = "",
  originalClassName = "fc-price-original",
  saleClassName = "fc-price-sale",
  minFractionDigits = 0,
  maxFractionDigits = 2,
  as = "p",
}) {
  const { original, sale, hasDiscount } = resolveVariantPrices(
    variant,
    product,
  );

  if (sale == null) {
    return null;
  }

  const Tag = as;

  const moneyOpts = {
    minFractionDigits,
    maxFractionDigits,
  };

  return (
    <Tag className={["fc-price-display", className].filter(Boolean).join(" ")}>
      {hasDiscount && (
        <span
          className={originalClassName}
          aria-label={`Original price ${original}`}
        >
          ₹{formatMoney(original, moneyOpts)}
        </span>
      )}

      <span
        className={[priceClassName, hasDiscount ? saleClassName : ""]
          .filter(Boolean)
          .join(" ")}
      >
        ₹{formatMoney(sale, moneyOpts)}
      </span>
    </Tag>
  );
}
