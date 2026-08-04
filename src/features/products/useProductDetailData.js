import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useBackgroundServerSync } from "../../hooks/useBackgroundServerSync.js";

import { stableStringify } from "../../utils/stableStringify.js";

import { useNavigate, useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import { fetchUserProduct } from "../shop/shopAPI.js";

import { fetchWishlist } from "../wishlist/wishlistAPI.js";

import { formatProductApiError } from "../../utils/productApiErrors.js";

export default function useProductDetailData() {
  const { productSlug } = useParams();

  const productSlugRef = useRef(productSlug);

  productSlugRef.current = productSlug;

  const lastProductSigRef = useRef(null);

  const lastWishlistSigRef = useRef("");

  const navigate = useNavigate();

  const {
    user,

    checkingAuth,
  } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const [galleryIndex, setGalleryIndex] = useState(0);

  const [qty, setQty] = useState(1);

  const [specsOpen, setSpecsOpen] = useState(true);

  const [shippingOpen, setShippingOpen] = useState(false);

  const [wishlistedVariantIds, setWishlistedVariantIds] = useState([]);

  useEffect(() => {
    lastProductSigRef.current = null;

    let cancelled = false;

    (async () => {
      setLoading(true);

      setError(null);

      try {
        const data = await fetchUserProduct(productSlug);

        if (cancelled) return;

        lastProductSigRef.current = stableStringify(data);

        setProduct(data);

        const first =
          data.variants?.find((v) => v.is_active) || data.variants?.[0];

        setSelectedVariantId(first?.id || null);
      } catch (err) {
        if (cancelled) return;

        const status = err.response?.status;

        if (status === 404) {
          navigate("/shop", {
            replace: true,
          });

          return;
        }

        setError(
          formatProductApiError(err.response?.data) || "Product not available.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [productSlug, navigate]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [productSlug]);

  const refreshProductSilently = useCallback(async () => {
    const ref = productSlugRef.current;

    if (!ref) return;

    try {
      const data = await fetchUserProduct(ref);

      const snap = stableStringify(data);

      if (lastProductSigRef.current === snap) {
        return;
      }

      lastProductSigRef.current = snap;

      setProduct(data);

      setSelectedVariantId((cur) => {
        const vars = data.variants || [];

        if (vars.some((v) => v.id === cur)) {
          return cur;
        }

        const first = vars.find((v) => v.is_active) || vars[0];

        return first?.id || null;
      });
    } catch {
      /* keep last good product payload */
    }
  }, []);

  useBackgroundServerSync({
    enabled: Boolean(productSlug),

    pollIntervalMs: 90_000,

    onRefresh: refreshProductSilently,
  });

  useEffect(() => {
    lastWishlistSigRef.current = "";

    let cancelled = false;

    if (!user) {
      setWishlistedVariantIds([]);

      return;
    }

    (async () => {
      try {
        const data = await fetchWishlist({
          page: 1,
          pageSize: 100,
        });

        if (cancelled) return;

        const ids = (data.results || [])

          .map((row) => row.variant?.id)

          .filter((id) => id != null)

          .map((id) => Number(id));

        lastWishlistSigRef.current = ids.join(",");

        setWishlistedVariantIds(ids);
      } catch {
        if (!cancelled) {
          setWishlistedVariantIds([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, productSlug]);

  const refreshWishlistSilently = useCallback(async () => {
    if (!user) return;

    try {
      const data = await fetchWishlist({
        page: 1,
        pageSize: 100,
      });

      const ids = (data.results || [])

        .map((row) => row.variant?.id)

        .filter((id) => id != null)

        .map((id) => Number(id));

      const sig = ids.join(",");

      if (lastWishlistSigRef.current === sig) {
        return;
      }

      lastWishlistSigRef.current = sig;

      setWishlistedVariantIds(ids);
    } catch {
      /* keep last ids */
    }
  }, [user]);

  useBackgroundServerSync({
    enabled: Boolean(user),

    pollIntervalMs: 90_000,

    onRefresh: refreshWishlistSilently,
  });

  useEffect(() => {
    setGalleryIndex(0);
  }, [selectedVariantId]);

  const selectedVariant = useMemo(
    () => product?.variants?.find((v) => v.id === selectedVariantId),

    [product, selectedVariantId],
  );

  const variantIsWishlisted = Boolean(
    user &&
    selectedVariant &&
    wishlistedVariantIds.includes(Number(selectedVariant.id)),
  );

  const galleryImages = useMemo(() => {
    if (!selectedVariant) return [];

    return (selectedVariant.images || []).map(
      (img) => img.image_url || img.image,
    );
  }, [selectedVariant]);

  const primaryImage = useMemo(() => {
    if (galleryImages.length) {
      const i = Math.min(
        galleryIndex,

        galleryImages.length - 1,
      );

      return galleryImages[i];
    }

    return product?.thumbnail;
  }, [galleryImages, galleryIndex, product]);

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : null;

  const stockLabel = product?.stock_status || "";

  const isOutOfStock =
    !selectedVariant ||
    !selectedVariant.is_active ||
    (selectedVariant.stock || 0) < 1;

  const refreshProduct = useCallback(async () => {
    const ref = productSlugRef.current;

    if (!ref) return;

    try {
      const data = await fetchUserProduct(ref);

      lastProductSigRef.current = stableStringify(data);

      setProduct(data);
    } catch {
      /* keep last good product payload */
    }
  }, []);

  return {
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
  };
}
