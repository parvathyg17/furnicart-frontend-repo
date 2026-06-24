import {
  ZoomIn,
} from "lucide-react";

import OfferBadge from "../../promotions/components/OfferBadge.jsx";

export default function ProductDetailGallery(
  {
    productName,
    primaryImage,
    galleryImages,
    galleryIndex,
    onSelectThumb,
    isOutOfStock,
    offerBadge,
    zoomViewportRef,
    imageZoom,
    onImagePointerDown,
    onImagePointerMove,
    onImagePointerUp,
    onImageDoubleClick,
  },
) {

  return (

    <div className="pd-gallery pd-user-gallery">

      <div className="pd-main-image-wrap pd-user-hero-image">

        {
          primaryImage ? (

            <div
              ref={zoomViewportRef}
              className={
                imageZoom.scale >
                1

                  ? "pd-interactive-zoom is-zoomed"

                  : "pd-interactive-zoom"
              }
              tabIndex={0}
              role="application"
              aria-label="Product image. Scroll to zoom. When zoomed, drag to pan. Double-click or Escape to reset."
              onPointerDown={onImagePointerDown}
              onPointerMove={onImagePointerMove}
              onPointerUp={onImagePointerUp}
              onPointerCancel={onImagePointerUp}
              onDoubleClick={onImageDoubleClick}
            >

              {
                isOutOfStock && (

                  <span className="fc-sold-out-badge">
                    Sold out
                  </span>
                )
              }

              <OfferBadge
                label={offerBadge?.label}
              />

              <div
                className="pd-interactive-zoom-track"
                style={{
                  transform: `translate3d(${imageZoom.panX}px, ${imageZoom.panY}px, 0) scale(${imageZoom.scale})`,
                }}
              >

                <img
                  src={primaryImage}
                  alt={productName}
                  draggable={false}
                />
              </div>

              <span
                className="pd-zoom-fab"
                title="Scroll to zoom · drag when zoomed · double-click or Esc to reset"
              >

                <ZoomIn
                  size={20}
                  strokeWidth={2}
                />
              </span>

              <span className="artisan-sr-only">
                Product image: scroll to zoom in. When zoomed, drag to pan.
                Double-click or Escape to reset.
              </span>
            </div>
          ) : (

            <div className="pd-main-image-empty">

              {
                isOutOfStock && (

                  <span className="fc-sold-out-badge">
                    Sold out
                  </span>
                )
              }

              <OfferBadge
                label={offerBadge?.label}
              />

              <div className="artisan-card-ph pd-user-ph">
                No image
              </div>
            </div>
          )
        }
      </div>

      {
        galleryImages.length > 1 && (

          <div className="pd-thumbs pd-user-thumbs">

            {
              galleryImages.map(
                (url, idx) => (

                  <button
                    key={`${url}-${idx}`}
                    type="button"
                    className={
                      idx ===
                      galleryIndex

                        ? "pd-thumb is-selected"

                        : "pd-thumb"
                    }
                    onClick={() => {

                      onSelectThumb(
                        idx,
                      );
                    }}
                  >

                    <img
                      src={url}
                      alt=""
                    />
                  </button>
                )
              )
            }
          </div>
        )
      }
    </div>
  );
}
