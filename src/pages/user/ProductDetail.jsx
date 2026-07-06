import "../../styles/shop.css";

import "../../styles/home.css";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  addToCartApi,
} from "../../features/cart/cartAPI";

import {
  toggleWishlistApi,
} from "../../features/wishlist/wishlistAPI.js";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

import useProductDetailData from "../../features/products/useProductDetailData.js";

import useProductImageZoom from "../../features/products/useProductImageZoom.js";

import ProductDetailBreadcrumbs from "../../features/products/components/ProductDetailBreadcrumbs.jsx";
import ProductDetailGallery from "../../features/products/components/ProductDetailGallery.jsx";
import ProductDetailBuyBox from "../../features/products/components/ProductDetailBuyBox.jsx";
import ProductDetailAccordions from "../../features/products/components/ProductDetailAccordions.jsx";
import ProductRelatedGrid from "../../features/products/components/ProductRelatedGrid.jsx";
import ProductDetailFooter from "../../features/products/components/ProductDetailFooter.jsx";
import ProductDetailReviews from "../../features/catalog/reviews/components/ProductDetailReviews.jsx";

import PublicNavbar from "../../components/common/PublicNavbar.jsx";
import { setWishlistCount } from "../../features/wishlist/wishlistSlice.jsx";
import { useDispatch } from "react-redux";
import { setCartItemCount } from "../../features/cart/cartSlice.js";

export default function ProductDetail() {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();

  const openReviewOnLoad =
    searchParams.get("writeReview") === "1";

  const {
    user,
    checkingAuth,
    product,
    loading,
    error,
    refreshProduct,
    selectedVariantId,
    setSelectedVariantId,
    galleryIndex,
    setGalleryIndex,
    qty,
    setQty,
    specsOpen,
    setSpecsOpen,
    shippingOpen,
    setShippingOpen,
    wishlistedVariantIds,
    setWishlistedVariantIds,
    selectedVariant,
    variantIsWishlisted,
    galleryImages,
    primaryImage,
    displayPrice,
    stockLabel,
    isOutOfStock,
  } = useProductDetailData();

  const {
    zoomViewportRef,
    imageZoom,
    onImagePointerDown,
    onImagePointerMove,
    onImagePointerUp,
    onImageDoubleClick,
  } = useProductImageZoom(
    primaryImage,
  );

  const shell = (children) => (

    <div className="artisan-shop pd-user-pdp-shell">

      <PublicNavbar />

      {children}
    </div>
  );

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

        const res=await addToCartApi({

          variantId:
            selectedVariant.id,

          quantity: qty,
        });

        toast.success(
          "Added to cart."
        );
        dispatch(
                  setCartItemCount(
                    res.item_count,
                    
                  ),
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
        dispatch(setWishlistCount(res.item_count));
      } catch (err) {

        toast.error(

          formatProductApiError(
            err.response?.data
          ) ||

            "Wishlist update failed."
        );
      }
    };

  if (checkingAuth) {

    return shell(

      <main className="artisan-main-wrap pd-user-main">

        <p className="artisan-muted">
          Loading…
        </p>
      </main>
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

  return shell(

    <>

      <main className="artisan-main-wrap pd-user-main pd-user-pdp">

        <ProductDetailBreadcrumbs product={product} />

        <div className="pd-layout pd-user-layout">

          <ProductDetailGallery
            productName={product.name}
            primaryImage={primaryImage}
            galleryImages={galleryImages}
            galleryIndex={galleryIndex}
            onSelectThumb={setGalleryIndex}
            isOutOfStock={isOutOfStock}
            offerBadge={product.offer_badge}
            zoomViewportRef={zoomViewportRef}
            imageZoom={imageZoom}
            onImagePointerDown={onImagePointerDown}
            onImagePointerMove={onImagePointerMove}
            onImagePointerUp={onImagePointerUp}
            onImageDoubleClick={onImageDoubleClick}
          />

          <div className="pd-info pd-user-info pd-user-pdp-info">

            <ProductDetailBuyBox
              product={product}
              selectedVariant={selectedVariant}
              displayPrice={displayPrice}
              stockLabel={stockLabel}
              isOutOfStock={isOutOfStock}
              selectedVariantId={selectedVariantId}
              onSelectVariant={(id) => {

                setSelectedVariantId(
                  id,
                );

                setQty(1);
              }}
              qty={qty}
              onQtyChange={(e) => {

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
              variantIsWishlisted={variantIsWishlisted}
              onAddToCart={handleAddToCart}
              onWishlistToggle={handleWishlist}
            />

            <ProductDetailAccordions
              selectedVariant={selectedVariant}
              specsOpen={specsOpen}
              onToggleSpecs={() => {

                setSpecsOpen(
                  !specsOpen,
                );
              }}
              shippingOpen={shippingOpen}
              onToggleShipping={() => {

                setShippingOpen(
                  !shippingOpen,
                );
              }}
            />
          </div>
        </div>

        <ProductDetailReviews
          product={product}
          user={user}
          onProductRefresh={refreshProduct}
          openReviewOnLoad={openReviewOnLoad}
        />

        <ProductRelatedGrid relatedProducts={product.related_products} />
      </main>

      <ProductDetailFooter />
    </>
  );
}
