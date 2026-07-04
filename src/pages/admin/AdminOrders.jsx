import "../../styles/admin-orders.css";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

import {
  fetchAdminOrders,
} from "../../features/admin/adminAPI";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

const PAGE_SIZE = 10;

const IMAGE_BASE = (
  import.meta.env.VITE_API_URL || ""
).replace(
  /\/$/,
  "",
);

const STATUS_FILTER = {
  "": "All statuses",
  pending: "Pending",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  partially_cancelled: "Partially cancelled",
  partially_shipped: "Partially shipped",
  partially_delivered: "Partially delivered",
};

const DEFAULT_ORDERING = "-placed_at";

const ORDERING_OPTIONS = [
  {
    value: "-placed_at",
    label: "Order date (newest first)",
  },
  {
    value: "placed_at",
    label: "Order date (oldest first)",
  },
  {
    value: "-grand_total",
    label: "Total (high to low)",
  },
  {
    value: "grand_total",
    label: "Total (low to high)",
  },
];

function formatMoney(
  v,
) {

  const n = Number(
    v,
  );

  if (
    Number.isNaN(
      n,
    )
  ) {

    return String(
      v ?? "—",
    );
  }

  return n.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function lineImageSrc(
  imageUrl,
) {

  if (
    !imageUrl
  ) {

    return null;
  }

  if (
    imageUrl.startsWith(
      "http",
    )
  ) {

    return imageUrl;
  }

  const path = imageUrl.startsWith(
    "/",
  )
    ? imageUrl
    : `/${imageUrl}`;

  return `${IMAGE_BASE}${path}`;
}

function displayNameFromEmail(
  email,
) {

  if (
    !email ||
    typeof email !== "string"
  ) {

    return "Customer";
  }

  const local = email.split(
    "@",
  )[
    0
  ] ||
    email;

  return local
    .replace(
      /[._-]+/g,
      " ",
    )
    .split(
      " ",
    )
    .filter(
      Boolean,
    )
    .map(
      (
        w,
      ) =>
        w.charAt(
          0,
        ).toUpperCase() +
        w.slice(
          1,
        ),
    )
    .join(
      " ",
    );
}

function formatDateBlock(
  iso,
) {

  if (
    !iso
  ) {

    return {
      date: "—",
      time: "",
    };
  }

  const d = new Date(
    iso,
  );

  if (
    Number.isNaN(
      d.getTime(),
    )
  ) {

    return {
      date: "—",
      time: "",
    };
  }

  return {
    date: d.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    ),
    time: d.toLocaleTimeString(
      undefined,
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    ),
  };
}

function statusPillClass(
  status,
) {

  switch (
    status
  ) {

    case "delivered":
    case "partially_delivered":
    case "shipped":
    case "partially_shipped":

      return "ao-status-pill ao-status-pill--green";

    case "out_for_delivery":

      return "ao-status-pill ao-status-pill--slate";

    case "pending":
    case "partially_cancelled":

      return "ao-status-pill ao-status-pill--amber";

    case "cancelled":

      return "ao-status-pill ao-status-pill--rose";

    default:

      return "ao-status-pill ao-status-pill--neutral";
  }
}

function statusLabel(
  status,
) {

  return STATUS_FILTER[
    status
  ] ||
    status ||
    "—";
}

function buildPageList(
  current,
  total,
) {

  if (
    total <= 7
  ) {

    return Array.from(
      {
        length: total,
      },
      (
        _,
        i,
      ) =>
        i + 1,
    );
  }

  const pages = new Set(
    [
      1,
      total,
      current,
      current - 1,
      current + 1,
    ],
  );

  const sorted = [
    ...pages,
  ].filter(
    (
      p,
    ) =>
      p >= 1 &&
      p <= total,
  ).sort(
    (
      a,
      b,
    ) =>
      a - b,
  );

  const out = [];

  let prev = 0;

  for (
    const p of sorted
  ) {

    if (
      p - prev >
      1
    ) {

      out.push(
        "…",
      );
    }

    out.push(
      p,
    );

    prev = p;
  }

  return out;
}

function productSummary(
  lineItems,
) {

  const items = lineItems ||
    [];

  if (
    items.length === 0
  ) {

    return {
      primary: "—",
      variant: "",
      thumbSrc: null,
      more: 0,
    };
  }

  const first = items[
    0
  ];

  const primary = first.product_name ||
    "Item";

  const variant = [
    first.variant_name,
    first.sku &&
      `SKU ${first.sku}`,
  ]
    .filter(
      Boolean,
    )
    .join(
      " · ",
    );

  const thumbSrc = lineImageSrc(
    first.image_url,
  );

  return {
    primary,
    variant,
    thumbSrc,
    more: Math.max(
      0,
      items.length - 1,
    ),
  };
}

export default function AdminOrders() {

  const [
    rows,
    setRows,
  ] = useState(
    [],
  );

  const [
    page,
    setPage,
  ] = useState(
    1,
  );

  const [
    totalPages,
    setTotalPages,
  ] = useState(
    1,
  );

  const [
    totalCount,
    setTotalCount,
  ] = useState(
    0,
  );

  const [
    search,
    setSearch,
  ] = useState(
    "",
  );

  const [
    draft,
    setDraft,
  ] = useState(
    "",
  );

  const [
    status,
    setStatus,
  ] = useState(
    "",
  );

  const [
    ordering,
    setOrdering,
  ] = useState(
    DEFAULT_ORDERING,
  );

  const [
    err,
    setErr,
  ] = useState(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const lastRowsSigRef =
    useRef(
      null,
    );

  const load =
    useCallback(
      async (
        { silent = false } = {},
      ) => {

        if (!silent) {

          setErr(
            null,
          );

          setLoading(
            true,
          );
        }

        try {

          const data =
            await fetchAdminOrders(
              {
                page,

                pageSize: PAGE_SIZE,

                search,

                status,

                ordering,
              },
            );

          const snap =
            stableStringify(
              {

                results:
                  data.results || [],

                total_pages:
                  data.total_pages || 1,

                count:
                  typeof data.count === "number"
                    ? data.count
                    : (
                      data.results || []
                    ).length,
              },
            );

          if (
            silent &&
            lastRowsSigRef.current ===
              snap
          ) {

            return;
          }

          lastRowsSigRef.current =
            snap;

          setRows(
            data.results || [],
          );

          setTotalPages(
            data.total_pages || 1,
          );

          setTotalCount(
            typeof data.count === "number"
              ? data.count
              : (data.results || []).length,
          );
        } catch (e) {

          if (!silent) {

            setErr(
              e.response?.data?.detail ||
                "Could not load orders.",
            );
          }
        } finally {

          if (!silent) {

            setLoading(
              false,
            );
          }
        }
      },
      [
        page,
        search,
        status,
        ordering,
      ],
    );

  useEffect(
    () => {

      lastRowsSigRef.current =
        null;

      load();
    },
    [load],
  );

  useBackgroundServerSync(
    {

      enabled: true,

      pollIntervalMs: 90_000,

      onRefresh:
        () =>
          load(
            {
              silent: true,
            },
          ),
    },
  );

  const start = totalCount === 0
    ? 0
    : (
      page - 1
    ) * PAGE_SIZE + 1;

  const end = Math.min(
    page * PAGE_SIZE,
    totalCount,
  );

  const pageNums = buildPageList(
    page,
    totalPages,
  );

  const filtersActive =
    Boolean(status) ||
    Boolean(search.trim()) ||
    Boolean(draft.trim()) ||
    ordering !== DEFAULT_ORDERING;

  const handleClearFilters = () => {

    setDraft(
      "",
    );

    setSearch(
      "",
    );

    setStatus(
      "",
    );

    setOrdering(
      DEFAULT_ORDERING,
    );

    setPage(
      1,
    );
  };

  return (

    <div className="ao-artisan">

      <p className="ao-breadcrumb">
        Admin
        <span>
          /
        </span>
        Order management
      </p>

      <h1 className="ao-title">
        Recent orders
      </h1>

      <form
        className="ao-toolbar"
        onSubmit={(e) => {

          e.preventDefault();

          setPage(
            1,
          );

          setSearch(
            draft.trim(),
          );
        }}
      >

        <div className="ao-search-wrap">

          <label className="ao-search" htmlFor="ao-order-search">

            <Search size={18} aria-hidden />

            <input
              id="ao-order-search"
              type="search"
              placeholder="Find orders by ID, customer email, product, variant, or SKU…"
              value={draft}
              onChange={(e) =>
                setDraft(
                  e.target.value,
                )
              }
            />

          </label>

        </div>

        <select
          className="ao-filter"
          value={status}
          onChange={(e) => {

            setPage(
              1,
            );

            setStatus(
              e.target.value,
            );
          }}
          aria-label="Filter by status"
        >

          {
            Object.entries(
              STATUS_FILTER,
            ).map(
              ([
                k,
                lab,
              ]) => (

                <option
                  key={
                    k || "all"
                  }
                  value={k}
                >
                  {lab}
                </option>
              ),
            )
          }

        </select>

        <select
          className="ao-filter"
          value={ordering}
          onChange={(e) => {

            setPage(
              1,
            );

            setOrdering(
              e.target.value,
            );
          }}
          aria-label="Sort orders"
        >

          {
            ORDERING_OPTIONS.map(
              (
                opt,
              ) => (

                <option
                  key={opt.value}
                  value={opt.value}
                >
                  {opt.label}
                </option>
              ),
            )
          }

        </select>

        <button
          type="submit"
          className="ao-btn-ghost"
        >
          Search
        </button>

        {
          filtersActive && (

            <button
              type="button"
              className="ao-btn-ghost"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          )
        }

      </form>

      {
        err && (

          <div className="ao-error" role="alert">
            {err}
          </div>
        )
      }

      <div className="ao-card">

        <div className="ao-table-scroll">

        <table className="ao-table">

          <thead>

            <tr>

              <th>
                Order ID
              </th>

              <th>
                Date
              </th>

              <th>
                Customer
              </th>

              <th>
                Product
              </th>

              <th>
                Status
              </th>

              <th style={{ textAlign: "right" }}>
                Total
              </th>

              <th style={{ width: "1%" }} aria-label="Actions" />
            </tr>

          </thead>

          <tbody>

            {
              loading
                ? (

                  <tr>

                    <td colSpan={7} style={{ padding: "2.5rem", textAlign: "center", color: "#78716c" }}>
                      Loading orders…
                    </td>

                  </tr>
                )
                : rows.length === 0 && !err
                  ? (

                    <tr>

                      <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#78716c" }}>
                        No orders match your filters.
                      </td>

                    </tr>
                  )
                  : rows.map(
                  (o) => {

                    const dt = formatDateBlock(
                      o.placed_at,
                    );

                    const email = o.user_email ||
                      "";

                    const prod = productSummary(
                      o.line_items,
                    );

                    const remainingTotal = Number(
                      o.remaining_value ?? o.grand_total,
                    ) || 0;

                    const originalTotal = Number(
                      o.original_paid ?? o.grand_total,
                    ) || 0;

                    const totalAdjusted = originalTotal - remainingTotal > 0.009;

                    return (

                      <tr key={o.id}>

                        <td>

                          <span className="ao-order-id">
                            #
                            {o.order_number}
                          </span>

                        </td>

                        <td>

                          <div className="ao-date-stack">

                            <strong>
                              {dt.date}
                            </strong>

                            {
                              dt.time
                                ? (
                                  <>
                                    {" "}
                                    |
                                    {" "}
                                    {dt.time}
                                  </>
                                )
                                : null
                            }

                          </div>

                        </td>

                        <td>

                          <div className="ao-customer">

                            <div className="ao-customer-name">
                              {displayNameFromEmail(
                                email,
                              )}
                            </div>

                            <div className="ao-customer-email">
                              {email || "—"}
                            </div>

                          </div>

                        </td>

                        <td className="ao-product-cell">

                          <div className="ao-product-row">

                            {
                              prod.thumbSrc
                                ? (

                                  <img
                                    className="ao-product-thumb"
                                    src={prod.thumbSrc}
                                    alt=""
                                  />
                                )
                                : (

                                  <div
                                    className="ao-product-thumb ao-product-thumb--empty"
                                    aria-hidden
                                  >
                                    No
                                    <br />
                                    image
                                  </div>
                                )
                            }

                            <div className="ao-product-text">

                              <div className="ao-product-primary">
                                {prod.primary}
                              </div>

                              {
                                prod.variant
                                  ? (

                                    <div className="ao-product-variant">
                                      {prod.variant}
                                    </div>
                                  )
                                  : null
                              }

                              {
                                prod.more > 0
                                  ? (

                                    <div className="ao-product-more">
                                      +
                                      {prod.more}
                                      {" "}
                                      more line
                                      {prod.more === 1 ? "" : "s"}
                                    </div>
                                  )
                                  : null
                              }
                            </div>
                          </div>

                        </td>

                        <td>

                          <span className={statusPillClass(
                            o.status,
                          )}
                          >

                            {statusLabel(
                              o.status,
                            )}
                          </span>

                        </td>

                        <td className="ao-total">
                          <span className="ao-total-current">
                            ₹{formatMoney(
                              Number(o.original_paid ?? o.grand_total) || 0
                            )}
                          </span>
                        </td>

                        <td>

                          <Link
                            className="ao-action-link"
                            to={
                              `/admin/orders/${encodeURIComponent(o.order_number)}`
                            }
                            title="View order"
                            aria-label="View order details"
                          >

                            <Eye size={18} />
                          </Link>

                        </td>

                      </tr>
                    );
                  })
            }

          </tbody>

        </table>

        </div>

        {
          totalCount > 0 && (

            <div className="ao-footer">

              <span>
                Showing
                {" "}
                {start}
                –
                {end}
                {" "}
                of
                {" "}
                {totalCount}
                {" "}
                order
                {totalCount === 1 ? "" : "s"}
              </span>

              {
                totalPages > 1 && (

                  <div className="ao-pagination">

                    <button
                      type="button"
                      className="ao-page-btn"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage(
                          (p) =>
                            Math.max(
                              1,
                              p - 1,
                            ),
                        )
                      }
                      aria-label="Previous page"
                    >

                      <ChevronLeft size={18} />
                    </button>

                    {
                      pageNums.map(
                        (
                          p,
                          i,
                        ) =>
                          p === "…"
                            ? (

                              <span
                                key={`e-${i}`}
                                className="ao-page-ellipsis"
                              >
                                …
                              </span>
                            )
                            : (

                              <button
                                key={p}
                                type="button"
                                className={
                                  `ao-page-btn${
                                    p === page
                                      ? " ao-page-btn--active"
                                      : ""
                                  }`
                                }
                                onClick={() =>
                                  setPage(
                                    p,
                                  )
                                }
                              >
                                {p}
                              </button>
                            ),
                      )
                    }

                    <button
                      type="button"
                      className="ao-page-btn"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage(
                          (p) =>
                            Math.min(
                              totalPages,
                              p + 1,
                            ),
                        )
                      }
                      aria-label="Next page"
                    >

                      <ChevronRight size={18} />
                    </button>

                  </div>
                )
              }

            </div>
          )
        }

      </div>

    </div>

  );
}
