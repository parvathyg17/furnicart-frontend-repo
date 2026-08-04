import "../../styles/admin-return.css";

import { useCallback, useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";

import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import {
  fetchAdminReturns,
  patchAdminReturn,
} from "../../features/admin/adminAPI";

import { useBackgroundServerSync } from "../../hooks/useBackgroundServerSync.js";

import { stableStringify } from "../../utils/stableStringify.js";

const PAGE_SIZE = 10;

const IMAGE_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const TABS = [
  {
    value: "",
    label: "All",
  },
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "accepted",
    label: "Accepted",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
];

const STATUS_LABEL = {
  pending: "Pending",
  approved: "Accepted",
  rejected: "Rejected",
  completed: "Fulfilled",
};

function lineImageSrc(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  const path = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;

  return `${IMAGE_BASE}${path}`;
}

function displayNameFromEmail(email) {
  if (!email || typeof email !== "string") {
    return "Customer";
  }

  const local = email.split("@")[0] || email;

  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function customerTagFromEmail(email) {
  if (!email || typeof email !== "string") {
    return "Customer";
  }

  const domain = email.split("@")[1];

  if (!domain) {
    return "Registered";
  }

  return `Account · ${domain}`;
}

function formatRequested(iso) {
  if (!iso) {
    return "—";
  }

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) {
    return "—";
  }

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function splitReason(reason) {
  const t = (reason || "").trim();

  if (!t) {
    return {
      head: "—",
      note: "",
    };
  }

  const parts = t.split(/\n+/);

  const head = (parts[0] || t).slice(0, 120);

  const restFromLines = parts.slice(1).join(" ").trim();

  const note =
    restFromLines ||
    (t.length > head.length ? t.slice(head.length).trim() : "");

  return {
    head,
    note,
  };
}

function statusPillClass(status) {
  switch (status) {
    case "pending":
      return "ar-status-pill ar-status-pill--pending";

    case "approved":
      return "ar-status-pill ar-status-pill--approved";

    case "rejected":
      return "ar-status-pill ar-status-pill--rejected";

    case "completed":
      return "ar-status-pill ar-status-pill--completed";

    default:
      return "ar-status-pill ar-status-pill--pending";
  }
}

function buildPageList(current, total) {
  if (total <= 7) {
    return Array.from(
      {
        length: total,
      },
      (_, i) => i + 1,
    );
  }

  const pages = new Set([1, total, current, current - 1, current + 1]);

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const out = [];

  let prev = 0;

  for (const p of sorted) {
    if (p - prev > 1) {
      out.push("…");
    }

    out.push(p);

    prev = p;
  }

  return out;
}

export default function AdminReturns() {
  const [rows, setRows] = useState([]);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalCount, setTotalCount] = useState(0);

  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");

  const [draft, setDraft] = useState("");

  const [err, setErr] = useState(null);

  const [loading, setLoading] = useState(true);

  const [busyId, setBusyId] = useState(null);

  const [processId, setProcessId] = useState(null);

  const [detailId, setDetailId] = useState(null);

  const lastReturnsSigRef = useRef(null);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setErr(null);

        setLoading(true);
      }

      try {
        const data = await fetchAdminReturns({
          page,

          pageSize: PAGE_SIZE,

          status,

          search,
        });

        const snap = stableStringify({
          results: data.results || [],

          total_pages: data.total_pages || 1,

          count:
            typeof data.count === "number"
              ? data.count
              : (data.results || []).length,
        });

        if (silent && lastReturnsSigRef.current === snap) {
          return;
        }

        lastReturnsSigRef.current = snap;

        setRows(data.results || []);

        setTotalPages(data.total_pages || 1);

        setTotalCount(
          typeof data.count === "number"
            ? data.count
            : (data.results || []).length,
        );
      } catch (e) {
        if (!silent) {
          setErr(e.response?.data?.detail || "Could not load returns.");
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [page, status, search],
  );

  useEffect(() => {
    setDetailId(null);

    setProcessId(null);

    lastReturnsSigRef.current = null;

    load();
  }, [load]);

  useBackgroundServerSync({
    enabled: true,

    pollIntervalMs: 90_000,

    onRefresh: () =>
      load({
        silent: true,
      }),
  });

  const act = async (id, body) => {
    setBusyId(id);

    setErr(null);

    try {
      await patchAdminReturn(id, body);

      setProcessId(null);

      await load();
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.status?.[0] ||
          "Action failed.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const end = Math.min(page * PAGE_SIZE, totalCount);

  const pageNums = buildPageList(page, totalPages);

  const filtersActive =
    Boolean(status) || Boolean(search.trim()) || Boolean(draft.trim());

  const handleClearFilters = () => {
    setDraft("");

    setSearch("");

    setStatus("");

    setPage(1);
  };

  return (
    <div className="ar-artisan">
      <p className="ar-breadcrumb">
        Admin
        <span>/</span>
        Returns management
      </p>

      <h1 className="ar-title">Returns management</h1>

      <p className="ar-lead">
        Review, process, and manage customer return requests with artisan care
        and precision.
      </p>

      <form
        className="ar-toolbar"
        onSubmit={(e) => {
          e.preventDefault();

          setPage(1);

          setSearch(draft.trim());
        }}
      >
        <div className="ar-search-wrap">
          <label className="ar-search" htmlFor="ar-return-search">
            <Search size={18} aria-hidden />

            <input
              id="ar-return-search"
              type="search"
              placeholder="Search returns by ID, order, customer, product, SKU, or reason…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
        </div>

        <button type="submit" className="ar-btn-ghost">
          Search
        </button>

        {filtersActive && (
          <button
            type="button"
            className="ar-btn-ghost"
            onClick={handleClearFilters}
          >
            Clear filters
          </button>
        )}
      </form>

      {err && (
        <div className="ar-error" role="alert">
          {err}
        </div>
      )}

      <div className="ar-card">
        <ul className="ar-tabs" role="tablist" aria-label="Filter by status">
          {TABS.map((tab) => (
            <li key={tab.value || "all"} role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={status === tab.value}
                className={`ar-tab${
                  status === tab.value ? " ar-tab--active" : ""
                }`}
                onClick={() => {
                  setPage(1);

                  setStatus(tab.value);
                }}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        <table className="ar-table">
          <thead>
            <tr>
              <th>Return</th>

              <th>Product</th>

              <th>Customer</th>

              <th>Reason</th>

              <th>Requested</th>

              <th>Status</th>

              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="ar-loading">
                  Loading returns…
                </td>
              </tr>
            ) : rows.length === 0 && !err ? (
              <tr>
                <td colSpan={7} className="ar-loading">
                  No returns match your filters.
                </td>
              </tr>
            ) : (
              rows
                .flatMap((r) => {
                  const email = r.user_email || "";

                  const img = lineImageSrc(r.image_url);

                  const { head, note } = splitReason(r.reason);

                  const detailOpen = detailId === r.id;

                  const processOpen = processId === r.id;

                  const mainRow = (
                    <tr key={r.id}>
                      <td>
                        <div className="ar-return-id">
                          # RT-
                          {r.id}
                        </div>

                        <div className="ar-order-sub">
                          Order{" "}
                          <Link
                            to={`/admin/orders/${encodeURIComponent(
                              r.order_number,
                            )}`}
                          >
                            #{r.order_number}
                          </Link>
                        </div>
                      </td>

                      <td>
                        <div className="ar-product-row">
                          {img ? (
                            <img className="ar-thumb" src={img} alt="" />
                          ) : (
                            <div
                              className="ar-thumb ar-thumb--empty"
                              aria-hidden
                            >
                              No
                              <br />
                              image
                            </div>
                          )}

                          <div>
                            <p className="ar-product-name">
                              {r.product_name || "—"}
                            </p>

                            {(r.variant_name || r.sku) && (
                              <p className="ar-product-meta">
                                {r.variant_name && (
                                  <>Variant: {r.variant_name}</>
                                )}

                                {r.variant_name && r.sku && " · "}

                                {r.sku && <>SKU {r.sku}</>}
                              </p>
                            )}

                            {r.quantity > 0 && (
                              <p className="ar-product-meta">
                                Qty: {r.quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="ar-customer-name">
                          {displayNameFromEmail(email)}
                        </div>

                        <div className="ar-customer-tag">
                          {customerTagFromEmail(email)}
                        </div>
                      </td>

                      <td>
                        <p className="ar-reason-head">{head}</p>

                        {note && <p className="ar-reason-note">{note}</p>}
                      </td>

                      <td>
                        <span className="ar-date">
                          {formatRequested(r.created_at)}
                        </span>
                      </td>

                      <td>
                        <span className={statusPillClass(r.status)}>
                          {STATUS_LABEL[r.status] || r.status}
                        </span>
                      </td>

                      <td>
                        <div className="ar-actions">
                          {r.status === "pending" && (
                            <>
                              {!processOpen ? (
                                <button
                                  type="button"
                                  className="ar-btn-primary"
                                  disabled={busyId === r.id}
                                  onClick={() => setProcessId(r.id)}
                                >
                                  Process return
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className="ar-btn-primary ar-btn-sm"
                                    disabled={busyId === r.id}
                                    onClick={() =>
                                      act(r.id, {
                                        status: "approved",
                                      })
                                    }
                                  >
                                    Accept
                                  </button>

                                  <button
                                    type="button"
                                    className="ar-btn-outline ar-btn-sm"
                                    disabled={busyId === r.id}
                                    onClick={() =>
                                      act(r.id, {
                                        status: "rejected",
                                        admin_note:
                                          "Rejected from admin panel.",
                                      })
                                    }
                                  >
                                    Reject
                                  </button>

                                  <button
                                    type="button"
                                    className="ar-btn-ghost ar-btn-sm"
                                    disabled={busyId === r.id}
                                    onClick={() => setProcessId(null)}
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                            </>
                          )}

                          {r.status === "approved" && (
                            <>
                              <button
                                type="button"
                                className="ar-btn-primary ar-btn-sm"
                                disabled={busyId === r.id}
                                onClick={() =>
                                  act(r.id, {
                                    status: "completed",
                                  })
                                }
                              >
                                Complete
                              </button>

                              <button
                                type="button"
                                className="ar-btn-outline ar-btn-sm"
                                onClick={() =>
                                  setDetailId(detailOpen ? null : r.id)
                                }
                              >
                                {detailOpen ? "Hide details" : "View details"}
                              </button>
                            </>
                          )}

                          {(r.status === "rejected" ||
                            r.status === "completed") && (
                            <button
                              type="button"
                              className="ar-btn-outline ar-btn-sm"
                              onClick={() =>
                                setDetailId(detailOpen ? null : r.id)
                              }
                            >
                              {detailOpen ? "Hide details" : "View details"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );

                  const expand = detailOpen && (
                    <tr key={`${r.id}-detail`} className="ar-expand">
                      <td colSpan={7}>
                        <div>
                          <strong>Full reason</strong>

                          <p
                            style={{
                              margin: "0.35rem 0 0.75rem",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {r.reason || "—"}
                          </p>

                          {r.admin_note && (
                            <>
                              <strong>Admin note</strong>

                              <p
                                style={{
                                  margin: "0.35rem 0 0",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {r.admin_note}
                              </p>
                            </>
                          )}

                          {r.resolved_at && (
                            <p style={{ margin: "0.75rem 0 0" }}>
                              <strong>Resolved</strong>{" "}
                              {formatRequested(r.resolved_at)}
                            </p>
                          )}

                          <p
                            style={{ margin: "0.5rem 0 0", fontSize: "0.8rem" }}
                          >
                            Line ID {r.line_id}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );

                  return expand ? [mainRow, expand] : [mainRow];
                })
                .flat()
            )}
          </tbody>
        </table>

        {totalCount > 0 && (
          <div className="ar-footer">
            <span>
              Showing {start}–{end} of {totalCount} return
              {totalCount === 1 ? "" : "s"}
            </span>

            {totalPages > 1 && (
              <div className="ar-pagination">
                <button
                  type="button"
                  className="ar-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>

                {pageNums.map((p, i) =>
                  p === "…" ? (
                    <span key={`e-${i}`} className="ar-page-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`ar-page-btn${
                        p === page ? " ar-page-btn--active" : ""
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className="ar-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="ar-copyright">© FurniCart admin · returns</p>
    </div>
  );
}
