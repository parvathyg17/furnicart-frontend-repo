import "../../styles/shop.css";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import toast from "react-hot-toast";

import {
  Heart,
  ZoomIn,
  ChevronDown,
} from "lucide-react";

import {
  fetchUserProduct,
} from "../../features/shop/shopAPI.js";

import {
  addToCartApi,
} from "../../features/cart/cartAPI";
import {
  fetchWishlist,
  toggleWishlistApi,
} from "../../features/wishlist/wishlistAPI.js";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

const ZOOM_SCALE_MIN = 1;

const ZOOM_SCALE_MAX = 4;

function clampPanForScale(
  scale,
  panX,
  panY,
  viewW,
  viewH,
) {

  if (
    scale <= ZOOM_SCALE_MIN ||
    !viewW ||
    !viewH
  ) {

    return {
      panX: 0,
      panY: 0,
    };
  }

  const marginX =
    ((scale - ZOOM_SCALE_MIN) * viewW) / 2;

  const marginY =
    ((scale - ZOOM_SCALE_MIN) * viewH) / 2;

  return {
    panX: Math.max(
      -marginX,
      Math.min(
        marginX,
        panX,
      ),
    ),
    panY: Math.max(
      -marginY,
      Math.min(
        marginY,
        panY,
      ),
    ),
  };
}

function formatMoney(n) {

  if (
    n === null ||
    n === undefined ||
    Number.isNaN(
      Number(n)
    )
  ) {

    return "—";
  }

  return Number(n).toLocaleString(
    undefined,
    {

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    }
  );
}

function isProductCardSoldOut(p) {

  const variants =
    p?.variants || [];

  if (!variants.length) {

    return (
      p?.stock_status ===
      "out_of_stock"
    );
  }

  return !variants.some(
    (v) =>
      v.is_active &&
      (v.stock || 0) > 0
  );
}

function relatedDisplayPrice(product) {

  const list =
    product?.variants?.filter(
      (v) =>
        v.is_active
    ) || [];

  const inStock =
    list.find(
      (v) =>
        (v.stock || 0) > 0
    );

  const v =
    inStock ||
    list[0] ||
    product?.variants?.[0];

  if (!v)
    return null;

  return Number(v.price);
}

export default function ProductDetail() {

  const {
    productId,
  } = useParams();

  const navigate = useNavigate();

  const {
    user,

    checkingAuth,
  } = useSelector(
    (state) => state.auth
  );

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    selectedVariantId,
    setSelectedVariantId,
  ] = useState(null);

  const [
    galleryIndex,
    setGalleryIndex,
  ] = useState(0);

  const zoomViewportRef =
    useRef(null);

  const imageZoomRef =
    useRef({
      scale: 1,
      panX: 0,
      panY: 0,
    });

  const [
    imageZoom,
    setImageZoom,
  ] = useState({
    scale: 1,
    panX: 0,
    panY: 0,
  });

  const imageDragRef =
    useRef(null);

  const [
    qty,
    setQty,
  ] = useState(1);

  const [
    specsOpen,
    setSpecsOpen,
  ] = useState(true);

  const [
    shippingOpen,
    setShippingOpen,
  ] = useState(false);

  const [
    wishlistedVariantIds,
    setWishlistedVariantIds,
  ] = useState([]);

  useEffect(() => {

    let cancelled = false;

    (
      async () => {

        setLoading(true);

        setError(null);

        try {

          const data =
            await fetchUserProduct(
              productId
            );

          if (cancelled)
            return;

          setProduct(data);

          const first =
            data.variants?.find(
              (v) => v.is_active
            ) || data.variants?.[0];

          setSelectedVariantId(
            first?.id || null
          );
        } catch (err) {

          if (cancelled)
            return;

          const status =
            err.response?.status;

          if (
            status === 404
          ) {

            navigate(
              "/shop",
              {
                replace: true,
              }
            );

            return;
          }

          setError(

            formatProductApiError(
              err.response?.data
            ) ||

              "Product not available."
          );
        } finally {

          if (!cancelled) {

            setLoading(false);
          }
        }
      }
    )();

    return () => {

      cancelled = true;
    };
  }, [

    productId,
    navigate,
  ]);

  useLayoutEffect(() => {

    window.scrollTo(
      0,
      0,
    );
  }, [productId]);

  useEffect(() => {

    const pollMs = 22000;

    let cancelled = false;

    const tick =
      async () => {

        if (
          document.visibilityState !==
          "visible" ||
          cancelled
        ) {

          return;
        }

        try {

          const data =
            await fetchUserProduct(
              productId
            );

          if (!cancelled) {

            setProduct(data);
          }
        } catch {

          /* keep last good product payload */
        }
      };

    const id =
      setInterval(
        tick,
        pollMs
      );

    const onVis =
      () => {

        if (
          document.visibilityState ===
          "visible" &&
          !cancelled
        ) {

          tick();
        }
      };

    document.addEventListener(
      "visibilitychange",
      onVis
    );

    return () => {

      cancelled = true;

      clearInterval(id);

      document.removeEventListener(
        "visibilitychange",
        onVis
      );
    };
  }, [productId]);

  useEffect(() => {

    let cancelled = false;

    if (!user) {

      setWishlistedVariantIds(
        []
      );

      return;
    }

    (
      async () => {

        try {

          const data =
            await fetchWishlist();

          if (cancelled)
            return;

          const ids =

            (data.results || [])

              .map(
                (row) =>
                  row.variant?.id
              )

              .filter(
                (id) =>
                  id != null
              )

              .map(
                (id) =>
                  Number(
                    id
                  )
              );

          setWishlistedVariantIds(
            ids
          );
        } catch {

          if (!cancelled) {

            setWishlistedVariantIds(
              []
            );
          }
        }
      }
    )();

    return () => {

      cancelled = true;
    };
  }, [

    user,
    productId,

  ]);

  useEffect(() => {

    setGalleryIndex(0);
  }, [selectedVariantId]);

  const selectedVariant =
    useMemo(
      () =>

        product?.variants?.find(
          (v) =>
            v.id ===
            selectedVariantId
        ),

      [product, selectedVariantId]
    );

  const variantIsWishlisted =
    Boolean(
      user &&
        selectedVariant &&
        wishlistedVariantIds.includes(
          Number(
            selectedVariant.id
          )
        )
    );

  const galleryImages =
    useMemo(
      () => {

        if (!selectedVariant)
          return [];

        return (
          selectedVariant.images || []
        ).map(
          (img) =>
            img.image_url ||
            img.image
        );
      },

      [selectedVariant]
    );

  const primaryImage =
    useMemo(
      () => {

        if (
          galleryImages.length
        ) {

          const i =
            Math.min(

              galleryIndex,

              galleryImages.length - 1
            );

          return galleryImages[i];
        }

        return product?.thumbnail;
      },

      [

        galleryImages,

        galleryIndex,

        product,
      ]
    );

  const displayPrice =
    selectedVariant
      ? Number(selectedVariant.price)
      : null;

  const stockLabel =
    product?.stock_status || "";

  const isOutOfStock =
    !selectedVariant ||
    !selectedVariant.is_active ||
    (selectedVariant.stock || 0) < 1;

  imageZoomRef.current =
    imageZoom;

  useEffect(() => {

    setImageZoom({
      scale: 1,
      panX: 0,
      panY: 0,
    });

    imageDragRef.current =
      null;
  }, [primaryImage]);

  useEffect(() => {

    const el =
      zoomViewportRef.current;

    if (
      !el ||
      !primaryImage
    ) {

      return;
    }

    const onWheel =
      (e) => {

        if (
          e.ctrlKey
        ) {

          return;
        }

        e.preventDefault();

        const rect =
          el.getBoundingClientRect();

        const vw =
          rect.width;

        const vh =
          rect.height;

        const factor =
          e.deltaY < 0
            ? 1.08
            : 1 / 1.08;

        setImageZoom(
          (z) => {

            const raw =
              Math.min(
                ZOOM_SCALE_MAX,
                Math.max(
                  ZOOM_SCALE_MIN,
                  z.scale * factor,
                ),
              );

            if (
              raw <=
              1.001
            ) {

              return {
                scale: 1,
                panX: 0,
                panY: 0,
              };
            }

            const nextScale =
              Math.max(
                1.02,
                raw,
              );

            return {
              scale: nextScale,

              ...clampPanForScale(
                nextScale,
                z.panX,
                z.panY,
                vw,
                vh,
              ),
            };
          }
        );
      };

    el.addEventListener(
      "wheel",
      onWheel,
      {
        passive: false,
      },
    );

    return () =>

      el.removeEventListener(
        "wheel",
        onWheel,
      );
  }, [primaryImage]);

  useEffect(() => {

    const onKey =
      (e) => {

        if (
          e.key ===
          "Escape"
        ) {

          setImageZoom({
            scale: 1,
            panX: 0,
            panY: 0,
          });

          imageDragRef.current =
            null;
        }
      };

    window.addEventListener(
      "keydown",
      onKey,
    );

    return () =>

      window.removeEventListener(
        "keydown",
        onKey,
      );
  }, []);

  const onImagePointerDown =
    useCallback(
      (e) => {

        const z =
          imageZoomRef.current;

        if (
          z.scale <=
          1
        ) {

          return;
        }

        imageDragRef.current =
          {
            id: e.pointerId,

            lx: e.clientX,

            ly: e.clientY,

            ox: z.panX,

            oy: z.panY,
          };

        e.currentTarget.setPointerCapture(
          e.pointerId,
        );
      },

      [],
    );

  const onImagePointerMove =
    useCallback(
      (e) => {

        const d =
          imageDragRef.current;

        if (
          !d ||
          d.id !==
            e.pointerId
        ) {

          return;
        }

        const el =
          zoomViewportRef.current;

        if (!el)
          return;

        const rect =
          el.getBoundingClientRect();

        const panX =
          d.ox +
          (e.clientX -
            d.lx);

        const panY =
          d.oy +
          (e.clientY -
            d.ly);

        const scale =
          imageZoomRef.current
            .scale;

        const clamped =
          clampPanForScale(
            scale,
            panX,
            panY,
            rect.width,
            rect.height,
          );

        setImageZoom({
          scale,

          ...clamped,
        });
      },

      [],
    );

  const onImagePointerUp =
    useCallback(
      (e) => {

        if (
          imageDragRef.current
            ?.id ===
          e.pointerId
        ) {

          imageDragRef.current =
            null;
        }
      },

      [],
    );

  const onImageDoubleClick =
    useCallback(() => {

      setImageZoom({
        scale: 1,
        panX: 0,
        panY: 0,
      });

      imageDragRef.current =
        null;
    }, []);

  const handleAddToCart =
    async () => {

      if (!user) {

        navigate(
          "/login"
        );

        return;
      }

      if (
        !selectedVariant ||
        isOutOfStock
      ) {

        toast.error(

          "This option is out of stock or unavailable."
        );

        return;
      }

      try {

        await addToCartApi({

          variantId:
            selectedVariant.id,

          quantity: qty,
        });

        toast.success(
          "Added to cart."
        );
      } catch (err) {

        toast.error(

          formatProductApiError(
            err.response?.data
          ) ||

            "Could not add to cart."
        );
      }
    };

  const handleWishlist =
    async () => {

      if (!user) {

        navigate(
          "/login"
        );

        return;
      }

      if (!selectedVariant)
        return;

      try {

        const res =
          await toggleWishlistApi(
            selectedVariant.id
          );

        const vid =
          Number(
            selectedVariant.id
          );

        setWishlistedVariantIds(
          (prev) => {

            if (
              res.is_wishlisted
            ) {

              if (
                prev.includes(
                  vid
                )
              ) {

                return prev;
              }

              return [

                ...prev,

                vid,
              ];
            }

            return prev.filter(
              (id) =>
                id !== vid
            );
          }
        );

        toast.success(

          res.is_wishlisted

            ? "Saved to wishlist."

            : "Removed from wishlist."
        );
      } catch (err) {

        toast.error(

          formatProductApiError(
            err.response?.data
          ) ||

            "Wishlist update failed."
        );
      }
    };

  const shell = (children) => (

    <div className="artisan-shop pd-user-pdp-shell">

      {children}

    </div>
  );

  if (checkingAuth) {

    return (

      <div className="artisan-shop pd-user-pdp-shell">

        <main className="artisan-main-wrap pd-user-main">

          <p className="artisan-muted">
            Loading…
          </p>

        </main>

      </div>
    );
  }

  if (
    loading &&
    !product
  ) {

    return shell(

      <main className="artisan-main-wrap pd-user-main">

        <p className="artisan-muted">
          Loading product…
        </p>

      </main>
    );
  }

  if (error) {

    return shell(

      <main className="artisan-main-wrap pd-user-main">

        <div
          className="artisan-banner error"
          role="alert"
        >

          {error}

        </div>

        <Link
          to="/shop"
          className="pd-user-back-shop"
        >
          Back to shop
        </Link>

      </main>
    );
  }

  if (!product)
    return null;

  const specMaterialsText =
    [
      selectedVariant?.color,

      selectedVariant?.material,
    ]

      .filter(Boolean)

      .join(" · ") || "";

  const pdpBadges = [];

  if ((product.brand || "").trim()) {

    pdpBadges.push({
      key: "brand",
      label: String(product.brand).trim(),
    });
  }

  (product.room_types || [])
    .slice(
      0,
      2,
    )
    .forEach(
      (rt) => {

        pdpBadges.push({
          key: `room-${rt.id}`,
          label: rt.name,
        });
      }
    );

  if (
    product.is_featured &&
    pdpBadges.length < 3
  ) {

    pdpBadges.push({
      key: "featured",
      label: "Featured",
    });
  }

  return shell(

    <>

      <main className="artisan-main-wrap pd-user-main pd-user-pdp">

        <nav
          className="pd-user-breadcrumbs"
          aria-label="Breadcrumb"
        >

          <Link to="/">
            Home
          </Link>

          <span
            className="pd-user-bc-sep"
            aria-hidden="true"
          >
            /
          </span>

          <Link to="/shop">
            Shop
          </Link>

          {
            (product.breadcrumbs || []).map(
              (b) => (

                <span key={b.id}>

                  <span
                    className="pd-user-bc-sep"
                    aria-hidden="true"
                  >
                    /
                  </span>

                  <Link
                    to={`/shop?category=${encodeURIComponent(b.slug)}`}
                  >

                    {b.name}
                  </Link>

                </span>
              )
            )
          }

          <span
            className="pd-user-bc-sep"
            aria-hidden="true"
          >
            /
          </span>

          <span
            className="pd-user-bc-current"
            aria-current="page"
          >

            {product.name}
          </span>

        </nav>

        <div className="pd-layout pd-user-layout">

          <div className="pd-gallery pd-user-gallery">

            <div className="pd-main-image-wrap pd-user-hero-image">

              {
                primaryImage ? (

                  <div
                    ref={
                      zoomViewportRef
                    }
                    className={
                      imageZoom.scale >
                      1

                        ? "pd-interactive-zoom is-zoomed"

                        : "pd-interactive-zoom"
                    }
                    tabIndex={0}
                    role="application"
                    aria-label="Product image. Scroll to zoom. When zoomed, drag to pan. Double-click or Escape to reset."
                    onPointerDown={
                      onImagePointerDown
                    }
                    onPointerMove={
                      onImagePointerMove
                    }
                    onPointerUp={
                      onImagePointerUp
                    }
                    onPointerCancel={
                      onImagePointerUp
                    }
                    onDoubleClick={
                      onImageDoubleClick
                    }
                  >

                    {
                      isOutOfStock && (

                        <span className="fc-sold-out-badge">
                          Sold out
                        </span>
                      )
                    }

                    <div
                      className="pd-interactive-zoom-track"
                      style={{
                        transform: `translate3d(${imageZoom.panX}px, ${imageZoom.panY}px, 0) scale(${imageZoom.scale})`,
                      }}
                    >

                      <img
                        src={
                          primaryImage
                        }
                        alt={
                          product.name
                        }
                        draggable={
                          false
                        }
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

                      Product image: scroll to zoom in. When zoomed, drag to
                      pan. Double-click or Escape to reset.
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

                            setGalleryIndex(
                              idx
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

            <div className="pd-info pd-user-info pd-user-pdp-info">

              {
                pdpBadges.length > 0 && (

                  <div
                    className="pd-user-pdp-badges"
                    aria-label="Product highlights"
                  >

                    {
                      pdpBadges.map(
                        (b) => (

                          <span
                            key={b.key}
                            className="pd-user-pdp-badge"
                          >

                            {b.label}
                          </span>
                        )
                      )
                    }

                  </div>
                )
              }

              <h1 className="pd-user-title artisan-font-serif pd-user-pdp-title">

                {product.name}
              </h1>

              {
                displayPrice !== null && (

                  <p className="pd-user-price artisan-font-serif pd-user-pdp-price">

                    ₹
                    {formatMoney(displayPrice)}
                  </p>
                )
              }

              {
                product.description && (

                  <p className="pd-user-desc pd-user-pdp-desc">

                    {product.description}
                  </p>
                )
              }

              {
                stockLabel && (

                  <p className="pd-user-pdp-stock">

                    <span
                      className={
                        isOutOfStock

                          ? "is-out"

                          : ""
                      }
                    >

                      {stockLabel.replace(
                        /_/g,
                        " "
                      )}

                    </span>

                  </p>
                )
              }

              <section
                className="pd-user-pdp-options"
                aria-label="Product variants"
              >

                <p className="pd-user-pdp-field-label">
                  Select variant
                </p>

                <div className="pd-user-variant-pills">

                  {
                    product.variants?.map(
                      (v) => {

                        const variantSoldOut =
                          !v.is_active ||
                          (v.stock || 0) < 1;

                        const isSelected =
                          v.id ===
                          selectedVariantId;

                        return (

                          <button
                            key={v.id}
                            type="button"
                            className={
                              [

                                "pd-user-variant-pill",

                                isSelected
                                  ? "is-selected"
                                  : "",

                                variantSoldOut
                                  ? "is-soldout"
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ")
                            }
                            onClick={() => {

                              setSelectedVariantId(
                                v.id
                              );

                              setQty(1);
                            }}
                          >

                            <span className="pd-user-variant-pill-name">

                              {v.variant_name}
                            </span>

                            <span className="pd-user-variant-pill-meta">

                              ₹
                              {formatMoney(v.price)}

                              {!variantSoldOut && (

                                <>

                                  {" "}
                                  
                                </>
                              )}

                              {variantSoldOut && (

                                <>

                                  {" "}
                                  · Sold out
                                </>
                              )}

                            </span>

                          </button>
                        );
                      }
                    )
                  }

                </div>

              </section>

              {
                isOutOfStock && (

                  <div
                    className="artisan-banner error pd-user-pdp-banner"
                    role="status"
                  >

                    This option is sold out or unavailable.
                  </div>
                )
              }

              <div className="pd-user-qty-row pd-user-pdp-qty">

                <label className="pd-user-qty">

                  <span>
                    Quantity
                  </span>

                  <input
                    type="number"
                    min={1}
                    max={
                      selectedVariant?.stock || 1
                    }
                    value={qty}
                    disabled={isOutOfStock}
                    onChange={(e) => {

                      const n =
                        Number(
                          e.target.value
                        ) || 1;

                      const cap =
                        selectedVariant?.stock || 1;

                      setQty(

                        Math.min(
                          Math.max(
                            1,
                            n
                          ),
                          cap
                        )
                      );
                    }}
                  />

                </label>

              </div>

              <div className="pd-user-actions pd-user-pdp-actions">

                <button
                  type="button"
                  className="pd-user-btn-cart"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >

                  Add to Cart
                </button>

                <button
                  type="button"
                  className={

                    variantIsWishlisted

                      ? "pd-user-btn-wish is-wishlisted"

                      : "pd-user-btn-wish"
                  }
                  aria-label={

                    variantIsWishlisted

                      ? "Remove from wishlist"

                      : "Add to wishlist"
                  }
                  onClick={handleWishlist}
                >

                  <Heart
                    size={18}
                    fill={

                      variantIsWishlisted

                        ? "currentColor"

                        : "none"
                    }
                    strokeWidth={

                      variantIsWishlisted

                        ? 1.5

                        : 2
                    }
                  />
                </button>

              </div>

              <div className="pd-user-pdp-accordions">

                <div className="pd-user-accordion pd-user-pdp-accordion">

                  <button
                    type="button"
                    className="pd-user-acc-head"
                    onClick={() =>
                      setSpecsOpen(
                        !specsOpen
                      )
                    }
                  >

                    <span>
                      Product specifications
                    </span>

                    <ChevronDown
                      size={20}
                      className={
                        specsOpen

                          ? "is-open"

                          : ""
                      }
                    />

                  </button>

                  {
                    specsOpen && (

                      <div className="pd-user-acc-body">

                        <div className="pd-user-spec-grid pd-user-pdp-spec-grid">

                          {
                            selectedVariant?.size && (

                              <div>

                                <strong>
                                  Dimensions
                                </strong>

                                <p>
                                  {selectedVariant.size}
                                </p>

                              </div>
                            )
                          }

                          {
                            specMaterialsText && (

                              <div>

                                <strong>
                                  Materials
                                </strong>

                                <p>
                                  {specMaterialsText}
                                </p>

                              </div>
                            )
                          }

                          {
                            selectedVariant?.sku && (

                              <div>

                                <strong>
                                  SKU
                                </strong>

                                <p>
                                  {selectedVariant.sku}
                                </p>

                              </div>
                            )
                          }

                          <div>

                            <strong>
                              Availability
                            </strong>

                            <p>

                              {selectedVariant
                                ? `${selectedVariant.stock} in stock`
                                : "—"}
                            </p>

                          </div>

                          <div>

                            <strong>
                              Care
                            </strong>

                            <p>

                              Dust regularly; spot-clean with a soft dry cloth.
                              Avoid harsh chemicals.
                            </p>

                          </div>

                        </div>

                      </div>
                    )
                  }

                </div>

                <div className="pd-user-accordion pd-user-pdp-accordion">

                  <button
                    type="button"
                    className="pd-user-acc-head"
                    onClick={() =>
                      setShippingOpen(
                        !shippingOpen
                      )
                    }
                  >

                    <span>
                      Shipping & returns
                    </span>

                    <ChevronDown
                      size={20}
                      className={
                        shippingOpen

                          ? "is-open"

                          : ""
                      }
                    />

                  </button>

                  {
                    shippingOpen && (

                      <div className="pd-user-acc-body">

                        <p className="pd-user-pdp-shipping-copy">

                          Standard delivery to your room of choice. White-glove
                          assembly available in select areas. Returns accepted
                          within 30 days of delivery if the item is unused and
                          in original packaging. Contact support for a return
                          authorization.
                        </p>

                      </div>
                    )
                  }

                </div>

              </div>

            </div>

        </div>

        {
          product.related_products &&
          product.related_products.length > 0 && (

            <section
              className="pd-related pd-user-related pd-user-pdp-related"
              aria-label="Complete the look"
            >

              <h2 className="pd-user-related-title pd-user-pdp-related-title artisan-font-serif">

                Complete the Look
              </h2>

              <div className="artisan-grid pd-user-related-grid pd-user-pdp-related-grid">

                {
                  product.related_products

                    .filter(
                      (rp) =>
                        rp?.id != null,
                    )

                    .map(
                    (rp) => {

                      const rpSoldOut =
                        isProductCardSoldOut(
                          rp
                        );

                      const rpPrice =
                        relatedDisplayPrice(
                          rp
                        );

                      return (

                        <article
                          key={rp.id}
                          className="artisan-card pd-user-related-card pd-user-pdp-related-card"
                        >

                          <Link
                            className="artisan-card-media pd-user-related-media"
                            to={`/shop/product/${rp.id}`}
                          >

                            {
                              rpSoldOut && (

                                <span className="fc-sold-out-badge">
                                  Sold out
                                </span>
                              )
                            }

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
                              to={`/shop/product/${rp.id}`}
                            >

                              <h3 className="artisan-font-serif pd-user-related-name">

                                {rp.name}
                              </h3>

                              {
                                rpPrice !== null && (

                                  <p className="pd-user-pdp-related-price">

                                    ₹
                                    {formatMoney(rpPrice)}
                                  </p>
                                )
                              }

                            </Link>

                          </div>

                        </article>
                      );
                    }
                  )
                }

              </div>

            </section>
          )
        }

      </main>

      <footer className="artisan-footer artisan-footer-pdp">

        <div className="artisan-footer-inner artisan-footer-pdp-inner">

          <div className="artisan-footer-pdp-links">

            <span>
              Sustainability
            </span>

            <span>
              Craftsmanship
            </span>

            <span>
              Shipping
            </span>

          </div>

          <p className="artisan-footer-copy artisan-footer-pdp-copy">

            © {new Date().getFullYear()} FurniCart. Crafted for longevity.
          </p>

        </div>

      </footer>

    </>

  );
}
