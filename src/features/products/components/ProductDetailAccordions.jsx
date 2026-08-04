import { ChevronDown } from "lucide-react";

export default function ProductDetailAccordions({
  selectedVariant,
  specsOpen,
  onToggleSpecs,
  shippingOpen,
  onToggleShipping,
}) {
  const specMaterialsText =
    [selectedVariant?.color, selectedVariant?.material]
      .filter(Boolean)
      .join(" · ") || "";

  return (
    <div className="pd-user-pdp-accordions">
      <div className="pd-user-accordion pd-user-pdp-accordion">
        <button
          type="button"
          className="pd-user-acc-head"
          onClick={onToggleSpecs}
        >
          <span>Product specifications</span>

          <ChevronDown size={20} className={specsOpen ? "is-open" : ""} />
        </button>

        {specsOpen && (
          <div className="pd-user-acc-body">
            <div className="pd-user-spec-grid pd-user-pdp-spec-grid">
              {selectedVariant?.size && (
                <div>
                  <strong>Dimensions</strong>

                  <p>{selectedVariant.size}</p>
                </div>
              )}

              {specMaterialsText && (
                <div>
                  <strong>Materials</strong>

                  <p>{specMaterialsText}</p>
                </div>
              )}

              {selectedVariant?.sku && (
                <div>
                  <strong>SKU</strong>

                  <p>{selectedVariant.sku}</p>
                </div>
              )}

              <div>
                <strong>Availability</strong>

                <p>
                  {selectedVariant ? `${selectedVariant.stock} in stock` : "—"}
                </p>
              </div>

              <div>
                <strong>Care</strong>

                <p>
                  Dust regularly; spot-clean with a soft dry cloth. Avoid harsh
                  chemicals.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pd-user-accordion pd-user-pdp-accordion">
        <button
          type="button"
          className="pd-user-acc-head"
          onClick={onToggleShipping}
        >
          <span>Shipping & returns</span>

          <ChevronDown size={20} className={shippingOpen ? "is-open" : ""} />
        </button>

        {shippingOpen && (
          <div className="pd-user-acc-body">
            <p className="pd-user-pdp-shipping-copy">
              Standard delivery to your room of choice. White-glove assembly
              available in select areas. Returns accepted within 30 days of
              delivery if the item is unused and in original packaging. Contact
              support for a return authorization.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
