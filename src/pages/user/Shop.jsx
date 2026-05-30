import "../../styles/shop.css";

import "../../styles/home.css";

import logofc from "../../assets/images/logofc.png";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Heart,
} from "lucide-react";
import {
  fetchUserProducts,
  fetchUserCategories,
  fetchUserRoomTypes,
} from "../../features/shop/shopAPI";

import {
  addToCartApi,
} from "../../features/cart/cartAPI";

import {
  toggleWishlistApi,
} from "../../features/wishlist/wishlistAPI";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

const SORT_OPTIONS = [

  {
    value: "latest",
    label: "Newest",
  },

  {
    value: "price_low",
    label: "Price: Low to high",
  },

  {
    value: "price_high",
    label: "Price: High to low",
  },

  {
    value: "a_z",
    label: "Name: A–Z",
  },

  {
    value: "z_a",
    label: "Name: Z–A",
  },
];

function firstListableVariant(product) {

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

  return (
    inStock ||
    list[0] ||
    null
  );
}

function displayPrice(product) {

  const v =
    firstListableVariant(product);

  if (
    !v &&
    product?.variants?.length
  ) {

    const prices =
      product.variants.map(
        (x) =>
          Number(x.price)
      );

    const min =
      Math.min(...prices);

    return min;
  }

  if (v)
    return Number(v.price);

  return null;
}

function isNewArrival(product) {

  if (!product?.created_at)
    return false;

  const created =
    new Date(
      product.created_at
    );

  const days =
    (Date.now() - created) /
    (86400 * 1000);

  return days <= 21;
}

export default function Shop() {

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const navigate = useNavigate();

  const {
    user,

    checkingAuth,
  } = useSelector(
    (state) => state.auth
  );

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

  const brand = searchParams.get("brand") || "";

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

        if (brand)
          next.brand = brand;

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
        brand,
        searchParams,
      ]
    );

  const queryForApiRef =
    useRef(
      queryForApi
    );

  queryForApiRef.current =
    queryForApi;

  useEffect(() => {

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

          setProducts(
            data.results || []
          );

          setPagination({

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
          });
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

  useEffect(() => {

    const pollMs = 25000;

    const tick =
      async () => {

        if (
          document.visibilityState !==
          "visible"
        ) {

          return;
        }

        const q =
          queryForApiRef.current;

        try {

          const data =
            await fetchUserProducts(
              q
            );

          setProducts(
            data.results || []
          );

          setPagination({

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
          });
        } catch {

          /* keep current listing */
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
          "visible"
        ) {

          tick();
        }
      };

    document.addEventListener(
      "visibilitychange",
      onVis
    );

    return () => {

      clearInterval(id);

      document.removeEventListener(
        "visibilitychange",
        onVis
      );
    };
  }, []);

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
      product
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
      product
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

  const pageNumbers =
    useMemo(
      () => {

        const total =
          pagination.totalPages;

        const cur =
          pagination.currentPage;

        if (total <= 7) {

          return Array.from(

            {
              length: total,
            },

            (_, i) =>
              i + 1
          );
        }

        const pages =
          new Set([
            1,
            total,
            cur,
            cur - 1,
            cur + 1,
          ]);

        return Array.from(pages)
          .filter(
            (n) =>
              n >= 1 && n <= total
          )
          .sort(
            (a, b) =>
              a - b
          );
      },

      [pagination]
    );

  if (checkingAuth) {

    return (

      <div className="home-loading">
        Loading...
      </div>
    );
  }

  return (

    <div className="artisan-shop">

      <header className="home-navbar">

        <div className="home-nav-inner">

          <Link
            to="/"
            className="home-logo"
          >

            <div className="auth-logo">

              <img
                src={logofc}
                alt="logo"
              />

            </div>

          </Link>

          <nav className="home-nav-links">

            <Link to="/">
              Home
            </Link>

            <Link to="/shop">
              Shop
            </Link>

            <Link to="/about">
              About
            </Link>

            <Link to="/contact">
              Contact
            </Link>

          </nav>

          <div className="home-nav-icons">

            <Link
              to={
                user
                  ? "/wishlist"
                  : "/login"
              }
              className="profile-nav-link"
              aria-label="Wishlist"
            >

              <Heart size={20} />
            </Link>

            <Link
              to={
                user
                  ? "/cart"
                  : "/login"
              }
              className="profile-nav-link"
              aria-label="Cart"
            >

              <ShoppingCart size={20} />
            </Link>

            <Link
              to={
                user
                  ? "/profile"
                  : "/login"
              }
              className="profile-nav-link"
            >

              {
                user ? (

                  user.profile_image ? (

                    <img
                      src={`http://127.0.0.1:8000${user.profile_image}`}
                      alt="profile"
                      className="nav-profile-image"
                    />

                  ) : (

                    <div className="nav-profile-avatar">

                      {
                        user.username?.charAt(0).toUpperCase()
                      }

                    </div>
                  )

                ) : (

                  <button className="login-nav-btn">

                    Login

                  </button>
                )
              }

            </Link>

          </div>

        </div>

      </header>

      <main className="artisan-main-wrap">

        <h1 className="artisan-title artisan-font-serif">
          Shop
        </h1>

        <p className="artisan-lead">
          Curated furniture for calm, considered spaces — filter by room,
          category, and price.
        </p>

        {
          toast && (

            <div
              className="artisan-toast"
              role="status"
            >

              {toast}
            </div>
          )
        }

        {
          error && (

            <div
              className="artisan-banner error"
              role="alert"
            >

              {error}
            </div>
          )
        }

        <div className="artisan-layout">

          <aside className="artisan-sidebar">

            <div className="artisan-sidebar-search">

              <Search
                size={18}
                className="artisan-sidebar-search-icon"
              />

              <input
                type="search"
                placeholder="Type to find pieces…"
                value={draftSearch}
                onChange={(e) =>
                  setDraftSearch(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key ===
                    "Enter"
                  ) {

                    e.preventDefault();

                    applySearch();
                  }
                }}
              />

              {
                draftSearch && (

                  <button
                    type="button"
                    className="artisan-clear-search"
                    aria-label="Clear"
                    onClick={clearSearch}
                  >

                    <X size={16} />
                  </button>
                )
              }

            </div>

            <button
              type="button"
              className="artisan-sidebar-apply"
              onClick={applySearch}
            >
              Apply search
            </button>

            <div className="artisan-field-block">

              <span className="artisan-field-label">
                Sort by
              </span>

              <select
                className="artisan-select"
                value={sort}
                onChange={(e) =>
                  patchParams({

                    sort: e.target.value,

                    page: 1,
                  })
                }
              >

                {
                  SORT_OPTIONS.map(
                    (o) => (

                      <option
                        key={o.value}
                        value={o.value}
                      >

                        {o.label}
                      </option>
                    )
                  )
                }

              </select>

            </div>

            <div className="artisan-field-block">

              <span className="artisan-field-label">
                Category
              </span>

              <ul className="artisan-check-list">

                <li>

                  <label className="artisan-check-row">

                    <input
                      type="radio"
                      name="shop-category"
                      checked={category === ""}
                      onChange={() =>
                        patchParams({

                          category: "",

                          page: 1,
                        })
                      }
                    />

                    <span>
                      All
                    </span>

                  </label>

                </li>

                {
                  categories.map(
                    (c) => (

                      <li key={c.id}>

                        <label className="artisan-check-row">

                          <input
                            type="radio"
                            name="shop-category"
                            checked={
                              category ===
                              c.slug
                            }
                            onChange={() =>
                              patchParams({

                                category:
                                  c.slug,

                                page: 1,
                              })
                            }
                          />

                          <span>
                            {c.name}
                          </span>

                        </label>

                      </li>
                    )
                  )
                }

              </ul>

            </div>

            <div className="artisan-field-block">

              <span className="artisan-field-label">
                Room type
              </span>

              <ul className="artisan-room-list">

                <li>

                  <button
                    type="button"
                    className={
                      roomType === ""

                        ? "is-active"

                        : ""
                    }
                    onClick={() =>
                      patchParams({

                        room_type: "",

                        page: 1,
                      })
                    }
                  >
                    All
                  </button>

                </li>

                {
                  roomTypes.map(
                    (r) => (

                      <li key={r.id}>

                        <button
                          type="button"
                          className={
                            roomType ===
                            r.slug

                              ? "is-active"

                              : ""
                          }
                          onClick={() =>
                            patchParams({

                              room_type:
                                r.slug,

                              page: 1,
                            })
                          }
                        >

                          {r.name}
                        </button>

                      </li>
                    )
                  )
                }

              </ul>

            </div>

            <div className="artisan-field-block">

              <span className="artisan-field-label">
                Price range
              </span>

              <div className="artisan-price-row">

                <label>

                  <span className="artisan-sr-only">
                    Min
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Min"
                    className="artisan-input"
                    value={minPrice}
                    onChange={(e) =>
                      patchParams({

                        min_price:
                          e.target.value,

                        page: 1,
                      })
                    }
                  />

                </label>

                <label>

                  <span className="artisan-sr-only">
                    Max
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Max"
                    className="artisan-input"
                    value={maxPrice}
                    onChange={(e) =>
                      patchParams({

                        max_price:
                          e.target.value,

                        page: 1,
                      })
                    }
                  />

                </label>

              </div>

            </div>

            <div className="artisan-field-block">

              <span className="artisan-field-label">
                Brand
              </span>

              <input
                type="text"
                className="artisan-input"
                placeholder="Filter by brand…"
                value={brand}
                onChange={(e) =>
                  patchParams({

                    brand:
                      e.target.value,

                    page: 1,
                  })
                }
              />

            </div>

          </aside>

          <section className="artisan-content">

            {
              loading ? (

                <p className="artisan-muted">
                  Loading pieces…
                </p>
              ) : products.length === 0 ? (

                <p className="artisan-muted">
                  No products match your filters.
                </p>
              ) : (

                <div className="artisan-grid">

                  {
                    products.map(
                      (p) => {

                        const price =
                          displayPrice(p);

                        const roomTag =
                          p.room_types?.[0]
                            ?.name;

                        const catTag =
                          p.category_name ||
                          "Furniture";

                        const isNew =
                          isNewArrival(p);

                        const variant =
                          firstListableVariant(
                            p
                          );

                        const canBuy =
                          variant &&
                          (variant.stock || 0) > 0;

                        const showSoldOut =
                          (p.variants?.length || 0) >
                            0 &&
                          (!canBuy ||
                            p.stock_status ===
                              "out_of_stock");

                        return (

                          <article
                            key={p.id}
                            className="artisan-card"
                          >

                            <Link
                              className="artisan-card-media"
                              to={`/shop/product/${p.id}`}
                            >

                              {
                                isNew && (

                                  <span className="artisan-badge-new">
                                    NEW ARRIVAL
                                  </span>
                                )
                              }

                              {
                                showSoldOut && (

                                  <span
                                    className="fc-sold-out-badge"
                                  >
                                    Sold out
                                  </span>
                                )
                              }

                              {
                                p.thumbnail ? (

                                  <img
                                    src={
                                      p.thumbnail
                                    }
                                    alt=""
                                  />
                                ) : (

                                  <div className="artisan-card-ph">
                                    No image
                                  </div>
                                )
                              }

                            </Link>

                            <div className="artisan-card-body">

                              <div className="artisan-card-tags">

                                <span className="artisan-tag sage">
                                  {(
                                    catTag ||
                                    ""
                                  ).toUpperCase()}
                                </span>

                                {
                                  roomTag && (

                                    <span className="artisan-tag outline">
                                      {roomTag.toUpperCase()}
                                    </span>
                                  )
                                }

                              </div>

                              <Link
                                className="artisan-card-title artisan-font-serif"
                                to={`/shop/product/${p.id}`}
                              >

                                {p.name}
                              </Link>

                              {
                                price !== null && (

                                  <p className="artisan-card-price">
                                    $
                                    {price.toLocaleString(
                                      undefined,
                                      {

                                        minimumFractionDigits: 0,

                                        maximumFractionDigits: 2,
                                      }
                                    )}
                                  </p>
                                )
                              }

                              <div className="artisan-card-actions">

                                <button
                                  type="button"
                                  className="artisan-btn-cart"
                                  disabled={
                                    !canBuy
                                  }
                                  onClick={(e) =>
                                    handleAddToCart(
                                      e,
                                      p
                                    )
                                  }
                                >
                                  ADD TO CART
                                </button>

                                <button
                                  type="button"
                                  className="artisan-btn-wish"
                                  aria-label="Add to wishlist"
                                  onClick={(e) =>
                                    handleWishlist(
                                      e,
                                      p
                                    )
                                  }
                                >

                                  <Heart size={18} />
                                </button>

                              </div>

                            </div>

                          </article>
                        );
                      }
                    )
                  }

                </div>
              )
            }

            {
              pagination.totalPages > 1 && (

                <nav
                  className="artisan-pagination"
                  aria-label="Pagination"
                >

                  <button
                    type="button"
                    className="artisan-page-arrow"
                    disabled={
                      !pagination.previous
                    }
                    onClick={() =>
                      patchParams({

                        page:
                          Math.max(
                            1,
                            page - 1
                          ),
                      })
                    }
                  >

                    <ChevronLeft size={18} />

                  </button>

                  {
                    pageNumbers.map(
                      (n) => (

                        <button
                          key={n}
                          type="button"
                          className={
                            n ===
                            pagination.currentPage

                              ? "artisan-page-num is-current"

                              : "artisan-page-num"
                          }
                          onClick={() =>
                            patchParams({
                              page: n,
                            })
                          }
                        >

                          {n}
                        </button>
                      )
                    )
                  }

                  <button
                    type="button"
                    className="artisan-page-arrow"
                    disabled={
                      !pagination.next
                    }
                    onClick={() =>
                      patchParams({

                        page:
                          page + 1,
                      })
                    }
                  >

                    <ChevronRight size={18} />
                  </button>

                </nav>
              )
            }

          </section>

        </div>

      </main>

      <footer className="artisan-footer">

        <div className="artisan-footer-inner">

          <div>

            <strong className="artisan-font-serif">
              FurniCart
            </strong>

            <p className="artisan-footer-tag">
              Thoughtful furniture for everyday living.
            </p>

          </div>

          <div className="artisan-footer-links">

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

          <p className="artisan-footer-copy">
            © {new Date().getFullYear()} FurniCart
          </p>

        </div>

      </footer>

    </div>
  );
}
