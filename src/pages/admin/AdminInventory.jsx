import "../../styles/admin-inventory.css";

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
  Filter,
  Bell,
  HelpCircle,
} from "lucide-react";

import {
  fetchAdminInventoryStock,
} from "../../features/admin/adminAPI";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

const PAGE_SIZE = 20;

const DEFAULT_ORDERING = "-id";

const HIGH_STOCK_MIN = 50;

const ORDERING_OPTIONS = [
  {
    value: "-id",
    label: "Recently updated variants",
  },
  {
    value: "stock",
    label: "Stock (low first)",
  },
  {
    value: "-stock",
    label: "Stock (high first)",
  },
  {
    value: "sku",
    label: "SKU (A–Z)",
  },
  {
    value: "-sku",
    label: "SKU (Z–A)",
  },
  {
    value: "product__name",
    label: "Product name (A–Z)",
  },
  {
    value: "-product__name",
    label: "Product name (Z–A)",
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

function formatCompactInventoryValue(
  value,
) {

  const n = Number(
    value,
  );

  if (
    Number.isNaN(
      n,
    )
  ) {

    return "—";
  }

  if (
    n >= 1e7
  ) {

    return `₹${(n / 1e7).toFixed(
      1,
    )} Cr`;
  }

  if (
    n >= 1e5
  ) {

    return `₹${(n / 1e5).toFixed(
      1,
    )}L`;
  }

  if (
    n >= 1e4
  ) {

    return `₹${(n / 1e3).toFixed(
      1,
    )}k`;
  }

  return `₹${formatMoney(
    n,
  )}`;
}

function formatThousands(
  n,
) {

  if (
    typeof n !== "number" ||
    Number.isNaN(
      n,
    )
  ) {

    return "—";
  }

  return n.toLocaleString(
    undefined,
  );
}

function variantSwatchColor(
  raw,
) {

  const s = String(
    raw || "",
  ).trim().toLowerCase();

  if (
    s.startsWith(
      "#",
    )
  ) {

    return s;
  }

  const map = {
    grey: "#9ca3af",
    gray: "#9ca3af",
    green: "#22c55e",
    white: "#f5f5f4",
    black: "#1c1917",
    brown: "#92400e",
    blue: "#3b82f6",
    red: "#ef4444",
    beige: "#d6d3d1",
    cream: "#faf5f0",
    walnut: "#5c4033",
    oak: "#c4a574",
  };

  return map[
    s
  ] || "#d6d3d1";
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

export default function AdminInventory() {

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
    ordering,
    setOrdering,
  ] = useState(
    DEFAULT_ORDERING,
  );

  const [
    lowStockFilter,
    setLowStockFilter,
  ] = useState(
    false,
  );

  const [
    summary,
    setSummary,
  ] = useState(
    null,
  );

  const [
    lowThreshold,
    setLowThreshold,
  ] = useState(
    10,
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

  const lastInventorySigRef =
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
            await fetchAdminInventoryStock(
              {
                page,

                pageSize: PAGE_SIZE,

                search,

                ordering,

                lowStock: lowStockFilter,
              },
            );

          const snapPayload =
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

              summary:
                data.summary ||
                null,
            };

          const snap =
            stableStringify(
              snapPayload,
            );

          if (
            silent &&
            lastInventorySigRef.current ===
              snap
          ) {

            return;
          }

          lastInventorySigRef.current =
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
              : (
                data.results || []
              ).length,
          );

          if (
            data.summary
          ) {

            setSummary(
              data.summary,
            );

            if (
              typeof data.summary.low_stock_threshold === "number"
            ) {

              setLowThreshold(
                data.summary.low_stock_threshold,
              );
            }
          }
        } catch (e) {

          if (!silent) {

            setSummary(
              null,
            );

            setErr(
              e.response?.data?.detail ||
                "Could not load inventory.",
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
        ordering,
        lowStockFilter,
      ],
    );

  useEffect(
    () => {

      lastInventorySigRef.current =
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
    Boolean(search.trim()) ||
    Boolean(draft.trim()) ||
    ordering !== DEFAULT_ORDERING ||
    lowStockFilter;

  const handleClearFilters = () => {

    setDraft(
      "",
    );

    setSearch(
      "",
    );

    setOrdering(
      DEFAULT_ORDERING,
    );

    setLowStockFilter(
      false,
    );

    setPage(
      1,
    );
  };

  const isLowStockRow = (
    stock,
  ) => {

    const s = Number(
      stock,
    );

    return (
      Number.isFinite(
        s,
      ) &&
      s > 0 &&
      s <= lowThreshold
    );
  };

  const isHighStock = (
    stock,
  ) => {

    const s = Number(
      stock,
    );

    return (
      Number.isFinite(
        s,
      ) &&
      s >= HIGH_STOCK_MIN
    );
  };

  return (

    <div className="inv-page">

      <p className="inv-breadcrumb">
        Admin
        <span>
          /
        </span>
        Inventory
      </p>

      <header className="inv-hero">

        <div className="inv-hero-main">

          <h1 className="inv-title">
            Inventory
          </h1>

          <p className="inv-lead">
            Track SKUs, spot low stock before you run out, and jump to any
            product to adjust pricing or quantities.
          </p>
        </div>

        <div className="inv-hero-tools">

          <form
            className="inv-search-form"
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

            <label className="inv-search" htmlFor="inv-admin-search">

              <Search size={18} aria-hidden />

              <input
                id="inv-admin-search"
                type="search"
                placeholder="Search variants…"
                value={draft}
                onChange={(e) =>
                  setDraft(
                    e.target.value,
                  )
                }
                autoComplete="off"
              />

            </label>
          </form>

          <div className="inv-hero-icons" aria-hidden>

            <button type="button" title="Notifications (coming soon)">
              <Bell size={18} />
            </button>

            <button type="button" title="Help (coming soon)">
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </header>

      {
        summary && (

          <div className="inv-stats">

            <div className="inv-stat-card">

              <div className="inv-stat-label">
                Total SKUs
              </div>

              <div className="inv-stat-value">
                {formatThousands(
                  summary.total_skus,
                )}
              </div>
            </div>

            <div className="inv-stat-card">

              <div className="inv-stat-label">
                Low stock alerts
              </div>

              <div className={`inv-stat-value${summary.low_stock_alerts > 0 ? " inv-stat-value--alert" : ""}`}>
                {formatThousands(
                  summary.low_stock_alerts,
                )}
              </div>
            </div>

            <div className="inv-stat-card">

              <div className="inv-stat-label">
                Inventory value
              </div>

              <div className="inv-stat-value">
                {formatCompactInventoryValue(
                  summary.inventory_value,
                )}
              </div>
            </div>
          </div>
        )
      }

      {
        err && (

          <div className="inv-error" role="alert">
            {err}
          </div>
        )
      }

      <div className="inv-panel">

        <div className="inv-toolbar">

          <select
            className="inv-toolbar-select"
            value={ordering}
            onChange={(e) => {

              setPage(
                1,
              );

              setOrdering(
                e.target.value,
              );
            }}
            aria-label="Sort variants"
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
            type="button"
            className={
              `inv-btn-filter${

                lowStockFilter
                  ? " inv-btn-filter--active"
                  : ""
              }`
            }
            onClick={() => {

              setPage(
                1,
              );

              setLowStockFilter(
                (
                  v,
                ) =>
                  !v,
              );
            }}
          >

            <Filter size={16} aria-hidden />
            Filters
          </button>

          {
            filtersActive && (

              <button
                type="button"
                className="inv-btn-clear"
                onClick={handleClearFilters}
              >
                Clear filters
              </button>
            )
          }

          <span className="inv-toolbar-meta">

            Showing
            {" "}
            {totalCount === 0
              ? 0
              : `${start}–${end}`}
            {" "}
            of
            {" "}
            {formatThousands(
              totalCount,
            )}
            {" "}
            variants
          </span>
        </div>

        <div className="inv-table-wrap">

          <table className="inv-table">

            <thead>

              <tr>

                <th>
                  Product
                </th>

                <th>
                  Variant
                </th>

                <th>
                  SKU
                </th>

                <th className="inv-th-num">
                  Stock
                </th>

                <th className="inv-th-num">
                  Price
                </th>

                <th className="inv-th-num" aria-label="Actions" />
              </tr>
            </thead>

            <tbody>

              {
                loading
                  ? (

                    <tr>

                      <td className="inv-empty-cell" colSpan={6}>
                        Loading inventory…
                      </td>
                    </tr>
                  )
                  : rows.length === 0 && !err
                    ? (

                      <tr>

                        <td className="inv-empty-cell" colSpan={6}>
                          No variants match your filters.
                        </td>
                      </tr>
                    )
                    : rows.map(
                      (
                        row,
                      ) => {

                        const stockN = Number(
                          row.stock,
                        );

                        const lowRow = isLowStockRow(
                          row.stock,
                        );

                        const high = isHighStock(
                          row.stock,
                        );

                        const dotColor = variantSwatchColor(
                          row.color,
                        );

                        return (

                          <tr
                            key={row.id}
                            className={lowRow ? "inv-tr--low" : undefined}
                          >

                            <td>

                              <span className="inv-product-name">
                                {row.product_name || "—"}
                              </span>
                            </td>

                            <td>

                              <div className="inv-variant-cell">

                                <span
                                  className="inv-color-dot"
                                  style={{
                                    background: dotColor,
                                  }}
                                  title={row.color || ""}
                                  aria-hidden
                                />

                                <span className="inv-variant-text">
                                  {row.variant_name || "—"}
                                </span>
                              </div>
                            </td>

                            <td>

                              <span className="inv-sku">
                                {row.sku || "—"}
                              </span>
                            </td>

                            <td className="inv-td-num">

                              <div className="inv-stock-wrap">

                                {
                                  high && !lowRow
                                    ? (

                                      <span className="inv-stock-pill inv-stock-pill--high">
                                        {stockN}
                                        {" "}
                                        in stock
                                      </span>
                                    )
                                    : lowRow
                                      ? (

                                        <div className="inv-stock-low">

                                          <span className="inv-stock-ring">
                                            {stockN}
                                          </span>

                                          <span className="inv-stock-low-label">
                                            LOW STOCK
                                          </span>
                                        </div>
                                      )
                                      : (

                                        <span className="inv-stock-num">
                                          {row.stock ?? 0}
                                        </span>
                                      )
                                }
                              </div>
                            </td>

                            <td className="inv-td-num">

                              <span className="inv-price">
                                ₹
                                {formatMoney(
                                  row.price,
                                )}
                              </span>
                            </td>

                            <td className="inv-td-num">

                              <Link
                                className="inv-action-link"
                                to={
                                  `/admin/products/${row.product_id}`
                                }
                              >
                                Edit product
                                <ChevronRight size={16} aria-hidden />
                              </Link>
                            </td>
                          </tr>
                        );
                      },
                    )
              }
            </tbody>
          </table>
        </div>

        {
          totalCount > 0 && (

            <div className="inv-pagination-bar">

              <span className="inv-page-label">
                Page
                {" "}
                {page}
                {" "}
                of
                {" "}
                {totalPages}
              </span>

              {
                totalPages > 1 && (

                  <nav className="inv-page-nav" aria-label="Inventory pages">

                    <button
                      type="button"
                      className="inv-page-btn"
                      disabled={page <= 1}
                      aria-label="Previous page"
                      onClick={() =>
                        setPage(
                          (
                            p,
                          ) =>
                            Math.max(
                              1,
                              p - 1,
                            ),
                        )
                      }
                    >

                      <ChevronLeft size={18} />
                    </button>

                    {
                      pageNums.map(
                        (
                          item,
                          idx,
                        ) =>

                          item === "…"
                            ? (

                              <span
                                key={
                                  `e-${idx}`
                                }
                                className="inv-page-ellipsis"
                              >
                                …
                              </span>
                            )
                            : (

                              <button
                                key={
                                  item
                                }
                                type="button"
                                className={
                                  `inv-page-num${

                                    item === page
                                      ? " inv-page-num--active"
                                      : ""
                                  }`
                                }
                                onClick={() =>
                                  setPage(
                                    item,
                                  )
                                }
                              >
                                {item}
                              </button>
                            ),
                      )
                    }

                    <button
                      type="button"
                      className="inv-page-btn"
                      disabled={page >= totalPages}
                      aria-label="Next page"
                      onClick={() =>
                        setPage(
                          (
                            p,
                          ) =>
                            Math.min(
                              totalPages,
                              p + 1,
                            ),
                        )
                      }
                    >

                      <ChevronRight size={18} />
                    </button>
                  </nav>
                )
              }
            </div>
          )
        }
      </div>
    </div>
  );
}
