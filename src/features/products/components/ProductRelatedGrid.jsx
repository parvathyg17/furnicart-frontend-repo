import {
  Link,
} from "react-router-dom";

import {
  isProductCardSoldOut,
  relatedDisplayVariant,
} from "../productDetailUtils.js";

import OfferBadge, {
  ProductPriceDisplay,
} from "../../promotions/components/OfferBadge.jsx";

import {
  shopProductPathFrom,
} from "../../../utils/shopProductPath.js";

export default function ProductRelatedGrid(
  {
    relatedProducts,
  },
) {

  if (
    !relatedProducts ||
    !relatedProducts.length
  ) {

    return null;
  }

  return (

    <section
      className="pd-related pd-user-related pd-user-pdp-related"
      aria-label="Complete the look"
    >

      <h2 className="pd-user-related-title pd-user-pdp-related-title artisan-font-serif">
        Complete the Look
      </h2>

      <div className="artisan-grid pd-user-related-grid pd-user-pdp-related-grid">

        {
          relatedProducts

            .filter(
              (rp) =>
                rp?.id != null,
            )

            .map(
              (rp) => {

                const rpSoldOut =
                  isProductCardSoldOut(
                    rp,
                  );

                const rpVariant =
                  relatedDisplayVariant(
                    rp,
                  );

                const rpPath =
                  shopProductPathFrom(
                    rp,
                  );

                return (

                  <article
                    key={rp.id}
                    className="artisan-card pd-user-related-card pd-user-pdp-related-card"
                  >

                    <Link
                      className="artisan-card-media pd-user-related-media"
                      to={
                        rpPath ||
                        "/shop"
                      }
                    >

                      {
                        rpSoldOut && (

                          <span className="fc-sold-out-badge">
                            Sold out
                          </span>
                        )
                      }

                      <OfferBadge
                        product={rp}
                      />

                      {
                        rp.thumbnail ? (

                          <img
                            src={rp.thumbnail}
                            alt=""
                          />
                        ) : (

                          <div className="artisan-card-ph">
                            No image
                          </div>
                        )
                      }
                    </Link>

                    <div className="artisan-card-body pd-user-pdp-related-body">

                      <Link
                        className="pd-user-related-card-detail-link"
                        to={
                          rpPath ||
                          "/shop"
                        }
                      >

                        <h3 className="artisan-font-serif pd-user-related-name">
                          {rp.name}
                        </h3>

                        {
                          rpVariant && (

                            <ProductPriceDisplay
                              variant={
                                rpVariant
                              }
                              product={rp}
                              className="pd-user-pdp-related-price"
                            />
                          )
                        }
                      </Link>
                    </div>
                  </article>
                );
              },
            )
        }
      </div>
    </section>
  );
}
