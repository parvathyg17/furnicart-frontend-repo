import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  fetchUserProducts,
  fetchUserCategories,
  fetchUserRoomTypes,
} from "./shopAPI.js";

import {
  addToCartApi,
} from "../cart/cartAPI.js";

import {
  toggleWishlistApi,
} from "../wishlist/wishlistAPI.js";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

import {
  buildShopPageNumbers,
  firstListableVariant,
} from "./shopListUtils.js";

export default function useShopCatalog() {

  const {
    user,
    checkingAuth,
  } = useSelector(
    (state) => state.auth
  );

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const navigate = useNavigate();

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({

    count: 0,

    totalPages: 1,

    currentPage: 1,

    next: null,

    previous: null,
  });

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    roomTypes,
    setRoomTypes,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    toast,
    setToast,
  ] = useState(null);

  const [
    draftSearch,
    setDraftSearch,
  ] = useState(
    () =>
      searchParams.get("search") || ""
  );

  const page = Number(
    searchParams.get("page") || 1
  );

  const sort = searchParams.get("sort") || "latest";

  const category = searchParams.get("category") || "";

  const roomType = searchParams.get("room_type") || "";

  const minPrice = searchParams.get("min_price") || "";

  const maxPrice = searchParams.get("max_price") || "";

  const pageSize = Number(
    searchParams.get("page_size") || 12
  );

  const loadFilters =
    useCallback(
      async () => {

        try {

          const [
            cats,
            rooms,
          ] = await Promise.all([
            fetchUserCategories(),

            fetchUserRoomTypes(),
          ]);

          setCategories(
            Array.isArray(cats) ? cats : []
          );

          setRoomTypes(
            Array.isArray(rooms) ? rooms : []
          );
        } catch {

          setCategories([]);

          setRoomTypes([]);
        }
      },

      []
    );

  useEffect(() => {

    loadFilters();
  }, [loadFilters]);

  useEffect(() => {

    setDraftSearch(
      searchParams.get("search") || ""
    );
  }, [searchParams]);

  const queryForApi =
    useMemo(
      () => {

        const next = {

          page,

          page_size: pageSize,

          sort,
        };

        const s =
          searchParams.get("search");

        if (s)
          next.search = s;

        if (category)
          next.category = category;

        if (roomType)
          next.room_type = roomType;

        if (minPrice)
          next.min_price = minPrice;

        if (maxPrice)
          next.max_price = maxPrice;

        return next;
      },

      [

        page,
        pageSize,
        sort,
        category,
        roomType,
        minPrice,
        maxPrice,
        searchParams,
      ]
    );

  const queryForApiRef =
    useRef(
      queryForApi
    );

  queryForApiRef.current =
    queryForApi;

  const lastListingSigRef =
    useRef(
      null,
    );

  useEffect(() => {

    lastListingSigRef.current =
      null;

    let cancelled = false;

    (
      async () => {

        setLoading(true);

        setError(null);

        try {

          const data =
            await fetchUserProducts(
              queryForApi
            );

          if (cancelled)
            return;

          const nextPagination =
            {

              count:
                data.count || 0,

              totalPages:
                data.total_pages || 1,

              currentPage:
                data.current_page || 1,

              next:
                data.next,

              previous:
                data.previous,
            };

          lastListingSigRef.current =
            stableStringify(
              {

                results:
                  data.results || [],

                pagination:
                  nextPagination,
              },
            );

          setProducts(
            data.results || []
          );

          setPagination(
            nextPagination,
          );
        } catch (err) {

          if (!cancelled) {

            setError(

              formatProductApiError(
                err.response?.data
              ) ||

                "Could not load products."
            );
          }
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
  }, [queryForApi]);

  const refreshListingSilently =
    useCallback(
      async () => {

        const q =
          queryForApiRef.current;

        try {

          const data =
            await fetchUserProducts(
              q,
            );

          const nextPagination =
            {

              count:
                data.count || 0,

              totalPages:
                data.total_pages || 1,

              currentPage:
                data.current_page || 1,

              next:
                data.next,

              previous:
                data.previous,
            };

          const snap =
            stableStringify(
              {

                results:
                  data.results || [],

                pagination:
                  nextPagination,
              },
            );

          if (
            lastListingSigRef.current ===
            snap
          ) {

            return;
          }

          lastListingSigRef.current =
            snap;

          setProducts(
            data.results || [],
          );

          setPagination(
            nextPagination,
          );
        } catch {

          /* keep current listing */
        }
      },

      [],
    );

  useBackgroundServerSync(
    {

      enabled: true,

      pollIntervalMs: 90_000,

      onRefresh:
        refreshListingSilently,
    },
  );

  const patchParams = (patch) => {

    const next = new URLSearchParams(
      searchParams
    );

    Object.entries(patch).forEach(

      ([k, v]) => {

        if (
          v === "" ||
          v === null ||
          v === undefined
        ) {

          next.delete(k);
        } else {

          next.set(
            k,
            String(v)
          );
        }
      }
    );

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

  const requireAuth = () => {

    navigate(
      "/login"
    );
  };

  const handleAddToCart =
    async (
      e,
      product,
    ) => {

      e.preventDefault();

      e.stopPropagation();

      if (!user) {

        requireAuth();

        return;
      }

      const variant =
        firstListableVariant(product);

      if (
        !variant ||
        (variant.stock || 0) < 1
      ) {

        setToast(

          "This item is unavailable."
        );

        return;
      }

      try {

        await addToCartApi({

          variantId: variant.id,

          quantity: 1,
        });

        setToast(
          "Added to cart."
        );
      } catch (err) {

        setToast(

          formatProductApiError(
            err.response?.data
          ) ||

            "Could not add to cart."
        );
      }
    };

  const handleWishlist =
    async (
      e,
      product,
    ) => {

      e.preventDefault();

      e.stopPropagation();

      if (!user) {

        requireAuth();

        return;
      }

      const variant =
        firstListableVariant(product);

      if (!variant) {

        setToast(

          "No variant available."
        );

        return;
      }

      try {

        await toggleWishlistApi(
          variant.id
        );

        setToast(
          "Wishlist updated."
        );
      } catch (err) {

        setToast(

          formatProductApiError(
            err.response?.data
          ) ||

            "Wishlist failed."
        );
      }
    };

  const pageNumbers =
    useMemo(
      () =>
        buildShopPageNumbers(
          pagination,
        ),

      [pagination]
    );

  useEffect(() => {

    if (!toast)
      return;

    const t =
      setTimeout(
        () =>
          setToast(null),

        2800
      );

    return () =>
      clearTimeout(t);
  }, [toast]);

  return {
    searchParams,
    patchParams,
    draftSearch,
    setDraftSearch,
    applySearch,
    clearSearch,
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
    user,
    checkingAuth,
  };
}
