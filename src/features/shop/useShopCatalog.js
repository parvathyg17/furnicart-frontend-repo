import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useBackgroundServerSync } from "../../hooks/useBackgroundServerSync.js";

import { stableStringify } from "../../utils/stableStringify.js";

import { useSearchParams, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";

import {
  fetchUserProducts,
  fetchUserCategories,
  fetchUserRoomTypes,
} from "./shopAPI.js";

import { addToCartApi } from "../cart/cartAPI.js";

import { setCartItemCount } from "../cart/cartSlice.js";

import {
  toggleWishlistApi,
  fetchWishlist,
} from "../../features/wishlist/wishlistAPI";

import {
  setWishlistCount,
  loadWishlistCount,
} from "../../features/wishlist/wishlistSlice";

import { formatProductApiError } from "../../utils/productApiErrors.js";

import {
  buildShopPageNumbers,
  catalogVariantForSort,
  wishlistedVariantForProduct,
} from "./shopListUtils.js";

export default function useShopCatalog() {
  const dispatch = useDispatch();

  const { user, checkingAuth } = useSelector((state) => state.auth);

  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [pagination, setPagination] = useState({
    count: 0,

    totalPages: 1,

    currentPage: 1,

    next: null,

    previous: null,
  });

  const [categories, setCategories] = useState([]);

  const [roomTypes, setRoomTypes] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [toast, setToast] = useState(null);

  const [wishlistedVariantIds, setWishlistedVariantIds] = useState([]);

  const lastWishlistSigRef = useRef("");

  const [draftSearch, setDraftSearch] = useState(
    () => searchParams.get("search") || "",
  );

  const page = Number(searchParams.get("page") || 1);

  const sort = searchParams.get("sort") || "latest";

  const category = searchParams.get("category") || "";

  const roomType = searchParams.get("room_type") || "";

  const minPrice = searchParams.get("min_price") || "";

  const maxPrice = searchParams.get("max_price") || "";

  const pageSize = Number(searchParams.get("page_size") || 8);

  const loadFilters = useCallback(async () => {
    try {
      const [cats, rooms] = await Promise.all([
        fetchUserCategories(),

        fetchUserRoomTypes(),
      ]);

      setCategories(Array.isArray(cats) ? cats : []);

      setRoomTypes(Array.isArray(rooms) ? rooms : []);
    } catch {
      setCategories([]);

      setRoomTypes([]);
    }
  }, []);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  const refreshWishlistSilently = useCallback(async () => {
    if (!user) {
      setWishlistedVariantIds([]);

      lastWishlistSigRef.current = "";

      return;
    }

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
      /* keep current wishlist ids */
    }
  }, [user]);

  useEffect(() => {
    lastWishlistSigRef.current = "";

    refreshWishlistSilently();
  }, [refreshWishlistSilently]);

  useEffect(() => {
    setDraftSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const queryForApi = useMemo(() => {
    const next = {
      page,

      page_size: pageSize,

      sort,
    };

    const s = searchParams.get("search");

    if (s) next.search = s;

    if (category) next.category = category;

    if (roomType) next.room_type = roomType;

    if (minPrice) next.min_price = minPrice;

    if (maxPrice) next.max_price = maxPrice;

    return next;
  }, [
    page,
    pageSize,
    sort,
    category,
    roomType,
    minPrice,
    maxPrice,
    searchParams,
  ]);

  const queryForApiRef = useRef(queryForApi);

  queryForApiRef.current = queryForApi;

  const lastListingSigRef = useRef(null);

  useEffect(() => {
    lastListingSigRef.current = null;

    let cancelled = false;

    (async () => {
      setLoading(true);

      setError(null);

      try {
        const data = await fetchUserProducts(queryForApi);

        if (cancelled) return;

        const nextPagination = {
          count: data.count || 0,

          totalPages: data.total_pages || 1,

          currentPage: data.current_page || 1,

          next: data.next,

          previous: data.previous,
        };

        lastListingSigRef.current = stableStringify({
          results: data.results || [],

          pagination: nextPagination,
        });

        setProducts(data.results || []);
        // const filteredProducts=(data.results||[]).filter((p)=>p.variants?.some((v)=>v.color==="Black"))
        // setProducts(filteredProducts)

        setPagination(nextPagination);
      } catch (err) {
        if (!cancelled) {
          setError(
            formatProductApiError(err.response?.data) ||
              "Could not load products.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [queryForApi]);

  const refreshListingSilently = useCallback(async () => {
    const q = queryForApiRef.current;

    try {
      const data = await fetchUserProducts(q);

      const nextPagination = {
        count: data.count || 0,

        totalPages: data.total_pages || 1,

        currentPage: data.current_page || 1,

        next: data.next,

        previous: data.previous,
      };

      const snap = stableStringify({
        results: data.results || [],

        pagination: nextPagination,
      });

      if (lastListingSigRef.current === snap) {
        return;
      }

      lastListingSigRef.current = snap;

      setProducts(data.results || []);

      setPagination(nextPagination);
    } catch {
      /* keep current listing */
    }
  }, []);

  useBackgroundServerSync({
    enabled: true,

    pollIntervalMs: 90_000,

    onRefresh: async () => {
      await Promise.all([refreshListingSilently(), refreshWishlistSilently()]);
    },
  });

  const patchParams = (patch) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v === null || v === undefined) {
        next.delete(k);
      } else {
        next.set(k, String(v));
      }
    });

    setSearchParams(next);
  };

  const applySearch = () => {
    patchParams({
      search: draftSearch.trim(),

      page: 1,
    });
  };

  const clearSearch = () => {
    setDraftSearch("");

    patchParams({
      search: "",

      page: 1,
    });
  };

  const clearFilters = () => {
    setDraftSearch("");

    setSearchParams(new URLSearchParams());
  };

  const variantOptions = useMemo(
    () => ({
      minPrice,

      maxPrice,
    }),

    [minPrice, maxPrice],
  );

  const requireAuth = () => {
    navigate("/login");
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();

    e.stopPropagation();

    if (!user) {
      requireAuth();

      return;
    }

    const variant = catalogVariantForSort(product, sort, variantOptions);

    if (!variant || (variant.stock || 0) < 1) {
      setToast("This item is unavailable.");

      return;
    }

    try {
      const res = await addToCartApi({
        variantId: variant.id,

        quantity: 1,
      });

      dispatch(setCartItemCount(res.item_count));

      setToast("Added to cart.");
    } catch (err) {
      setToast(
        formatProductApiError(err.response?.data) || "Could not add to cart.",
      );
    }
  };

  const handleWishlist = async (e, product) => {
    e.preventDefault();

    e.stopPropagation();

    if (!user) {
      requireAuth();

      return;
    }

    const existing = wishlistedVariantForProduct(product, wishlistedVariantIds);

    const variant =
      existing || catalogVariantForSort(product, sort, variantOptions);

    if (!variant) {
      setToast("No variant available.");

      return;
    }

    try {
      const res = await toggleWishlistApi(variant.id);

      const vid = Number(variant.id);

      setWishlistedVariantIds((prev) => {
        if (res.is_wishlisted) {
          if (prev.includes(vid)) {
            return prev;
          }

          return [...prev, vid];
        }

        return prev.filter((id) => id !== vid);
      });

      setToast(
        res.is_wishlisted ? "Saved to wishlist." : "Removed from wishlist.",
      );
      if (res.item_count !== undefined) {
        dispatch(setWishlistCount(res.item_count));
      } else {
        dispatch(loadWishlistCount());
      }
    } catch (err) {
      setToast(formatProductApiError(err.response?.data) || "Wishlist failed.");
    }
  };

  const pageNumbers = useMemo(
    () => buildShopPageNumbers(pagination),

    [pagination],
  );

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(
      () => setToast(null),

      2800,
    );

    return () => clearTimeout(t);
  }, [toast]);

  return {
    searchParams,
    patchParams,
    draftSearch,
    setDraftSearch,
    applySearch,
    clearSearch,
    clearFilters,
    sort,
    category,
    roomType,
    minPrice,
    maxPrice,
    products,
    pagination,
    pageNumbers,
    categories,
    roomTypes,
    loading,
    error,
    toast,
    setToast,
    requireAuth,
    handleAddToCart,
    handleWishlist,
    wishlistedVariantIds,
    user,
    checkingAuth,
  };
}
