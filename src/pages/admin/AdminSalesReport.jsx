import "../../styles/admin-orders.css";
import "../../styles/admin-sales-report.css";

import { useCallback, useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { Download } from "lucide-react";

import toast from "react-hot-toast";

import {
  downloadAdminSalesReportExport,
  fetchAdminSalesReport,
} from "../../features/admin/salesReportAPI";

const PAGE_SIZE = 10;

const PERIOD_TABS = [
  {
    id: "daily",
    label: "Today",
  },
  {
    id: "weekly",
    label: "Last 7 days",
  },
  {
    id: "yearly",
    label: "Year to date",
  },
  {
    id: "custom",
    label: "Custom",
  },
];

function formatMoney(value) {
  const n = Number(value ?? 0);

  if (Number.isNaN(n)) {
    return "0.00";
  }

  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateLabel(iso) {
  if (!iso) {
    return "—";
  }

  const d = new Date(`${iso}T12:00:00`);

  if (Number.isNaN(d.getTime())) {
    return iso;
  }

  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SummaryCard({ label, value, hint }) {
  return (
    <article className="asr-summary-card">
      <p className="asr-summary-label">{label}</p>

      <p className="asr-summary-value">{value}</p>

      {hint && <p className="asr-summary-hint">{hint}</p>}
    </article>
  );
}

export default function AdminSalesReports() {
  const [period, setPeriod] = useState("weekly");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [ordersPage, setOrdersPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [summary, setSummary] = useState(null);

  const [breakdown, setBreakdown] = useState([]);

  const [orders, setOrders] = useState([]);

  const [meta, setMeta] = useState({
    date_from: "",
    date_to: "",
    breakdown_granularity: "day",
    total_pages: 1,
    total_count: 0,
  });

  const [exporting, setExporting] = useState("");

  const applyReportPayload = useCallback(
    (data, { appendOrders = false } = {}) => {
      setSummary(data.summary || null);

      setBreakdown(data.breakdown || []);

      const nextOrders = data.results || data.orders || [];

      setOrders((prev) => {
        if (!appendOrders) {
          return nextOrders;
        }

        const seen = new Set(prev.map((order) => order.id));

        const merged = [...prev];

        nextOrders.forEach((order) => {
          if (!seen.has(order.id)) {
            merged.push(order);
          }
        });

        return merged;
      });

      setMeta({
        date_from: data.date_from || "",
        date_to: data.date_to || "",
        breakdown_granularity: data.breakdown_granularity || "day",
        total_pages: data.total_pages || 1,
        total_count: data.count ?? nextOrders.length,
      });
    },

    [],
  );

  const loadReport = useCallback(
    async (pageNum = 1, { appendOrders = false } = {}) => {
      if (period === "custom" && (!dateFrom || !dateTo)) {
        setLoading(false);

        setLoadingMore(false);

        setError("");

        setSummary(null);

        setBreakdown([]);

        setOrders([]);

        setOrdersPage(1);

        setMeta({
          date_from: "",
          date_to: "",
          breakdown_granularity: "day",
          total_pages: 1,
          total_count: 0,
        });

        return;
      }

      if (appendOrders) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data = await fetchAdminSalesReport({
          period,
          dateFrom,
          dateTo,
          page: pageNum,
          pageSize: PAGE_SIZE,
        });

        applyReportPayload(data, {
          appendOrders,
        });

        setOrdersPage(pageNum);
      } catch {
        setError(
          appendOrders
            ? "Could not load more orders."
            : "Could not load sales report.",
        );
      } finally {
        if (appendOrders) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },

    [period, dateFrom, dateTo, applyReportPayload],
  );

  useEffect(() => {
    setOrdersPage(1);

    if (period === "custom") {
      setLoading(false);

      setLoadingMore(false);

      setError("");

      setSummary(null);

      setBreakdown([]);

      setOrders([]);

      setMeta({
        date_from: "",
        date_to: "",
        breakdown_granularity: "day",
        total_pages: 1,
        total_count: 0,
      });

      return;
    }

    loadReport(1);
  }, [period, loadReport]);

  const applyCustomRange = () => {
    setOrdersPage(1);

    loadReport(1);
  };

  const handleSeeMore = () => {
    if (loadingMore || ordersPage >= meta.total_pages) {
      return;
    }

    loadReport(ordersPage + 1, {
      appendOrders: true,
    });
  };

  const hasMoreOrders = ordersPage < meta.total_pages;

  const handleExport = async (format) => {
    if (period === "custom" && (!dateFrom || !dateTo)) {
      toast.error("Choose a custom date range first.");

      return;
    }

    setExporting(format);

    try {
      await downloadAdminSalesReportExport({
        period,
        dateFrom,
        dateTo,
        format,
      });

      toast.success(format === "pdf" ? "PDF downloaded." : "Excel downloaded.");
    } catch (err) {
      toast.error(err?.message || "Export failed.");
    } finally {
      setExporting("");
    }
  };

  return (
    <div className="ao-artisan asr-page">
      <p className="ao-breadcrumb">
        Admin
        <span>/</span>
        Sales reports
      </p>

      <h1 className="ao-title">Sales reports</h1>

      <p className="asr-lead">
        Revenue and discount totals for placed orders (cancelled orders
        excluded).
      </p>

      <div className="asr-toolbar">
        <div className="asr-period-tabs">
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={period === tab.id ? "is-active" : ""}
              onClick={() => {
                setPeriod(tab.id);
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div className="asr-custom-range">
            <label>
              <span>From</span>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </label>

            <label>
              <span>To</span>

              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </label>

            <button
              type="button"
              className="asr-apply-btn"
              onClick={applyCustomRange}
            >
              Apply
            </button>
          </div>
        )}

        <div className="asr-export-actions">
          <button
            type="button"
            className="asr-export-btn"
            disabled={
              !!exporting || (period === "custom" && (!dateFrom || !dateTo))
            }
            onClick={() => handleExport("pdf")}
          >
            <Download size={16} />
            {exporting === "pdf" ? "Exporting…" : "PDF"}
          </button>

          <button
            type="button"
            className="asr-export-btn"
            disabled={
              !!exporting || (period === "custom" && (!dateFrom || !dateTo))
            }
            onClick={() => handleExport("excel")}
          >
            <Download size={16} />
            {exporting === "excel" ? "Exporting…" : "Excel"}
          </button>
        </div>
      </div>

      {meta.date_from && (
        <p className="asr-range-label">
          Reporting window: <strong>{formatDateLabel(meta.date_from)}</strong> –{" "}
          <strong>{formatDateLabel(meta.date_to)}</strong>
        </p>
      )}

      {loading && <p className="ao-muted">Loading report…</p>}

      {error && <p className="asr-error">{error}</p>}

      {period === "custom" && (!dateFrom || !dateTo) && (
        <p className="ao-muted">
          Choose a start and end date, then click Apply.
        </p>
      )}

      {!loading && !error && summary && (
        <>
          <section className="asr-summary-grid" aria-label="Report summary">
            <SummaryCard
              label="Orders"
              value={String(summary.order_count ?? 0)}
            />

            <SummaryCard
              label="Gross sales"
              value={`₹${formatMoney(summary.subtotal_gross)}`}
              hint="Before offer discounts"
            />

            <SummaryCard
              label="Offer savings"
              value={`₹${formatMoney(summary.offer_discount_total)}`}
            />

            <SummaryCard
              label="Coupon deductions"
              value={`₹${formatMoney(summary.coupon_discount_total)}`}
            />

            <SummaryCard
              label="Total discounts"
              value={`₹${formatMoney(summary.total_discount)}`}
            />

            <SummaryCard
              label="Net sales"
              value={`₹${formatMoney(summary.grand_total)}`}
              hint="Order totals incl. tax & shipping"
            />
          </section>

          {breakdown.length > 0 && (
            <section className="asr-section">
              <h2 className="asr-section-title artisan-font-serif">
                {meta.breakdown_granularity === "month"
                  ? "Monthly breakdown"
                  : "Daily breakdown"}
              </h2>

              <div className="asr-table-wrap">
                <table className="asr-table">
                  <thead>
                    <tr>
                      <th>Period</th>

                      <th>Orders</th>

                      <th>Gross</th>

                      <th>Offers</th>

                      <th>Coupons</th>

                      <th>Net sales</th>
                    </tr>
                  </thead>

                  <tbody>
                    {breakdown.map((row) => (
                      <tr key={row.date || row.label}>
                        <td>{row.label}</td>

                        <td>{row.order_count}</td>

                        <td>₹{formatMoney(row.subtotal_gross)}</td>

                        <td>₹{formatMoney(row.offer_discount_total)}</td>

                        <td>₹{formatMoney(row.coupon_discount_total)}</td>

                        <td>₹{formatMoney(row.grand_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="asr-section">
            <h2 className="asr-section-title artisan-font-serif">
              Orders in range
            </h2>

            {orders.length === 0 ? (
              <p className="ao-muted">No orders in this period.</p>
            ) : (
              <>
                <div className="asr-table-wrap">
                  <table className="asr-table">
                    <thead>
                      <tr>
                        <th>Order</th>

                        <th>Date</th>

                        <th>Customer</th>

                        <th>Payment</th>

                        <th>Offers</th>

                        <th>Coupon</th>

                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <Link
                              className="asr-order-link"
                              to={`/admin/orders/${encodeURIComponent(
                                order.order_number,
                              )}`}
                            >
                              {order.order_number}
                            </Link>
                          </td>

                          <td>{new Date(order.placed_at).toLocaleString()}</td>

                          <td>{order.customer_email}</td>

                          <td>{order.payment_method}</td>

                          <td>₹{formatMoney(order.offer_discount_total)}</td>

                          <td>
                            {Number(order.coupon_discount_total) > 0 ? (
                              <>
                                ₹{formatMoney(order.coupon_discount_total)}
                                {order.coupon_code && (
                                  <span className="asr-coupon-code">
                                    {" "}
                                    ({order.coupon_code})
                                  </span>
                                )}
                              </>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td>₹{formatMoney(order.grand_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {meta.total_count > 0 && (
                  <p className="asr-orders-count">
                    Showing {orders.length} of {meta.total_count} order
                    {meta.total_count === 1 ? "" : "s"}
                  </p>
                )}

                {hasMoreOrders && (
                  <div className="asr-see-more-wrap">
                    <button
                      type="button"
                      className="asr-see-more-btn"
                      disabled={loadingMore}
                      onClick={handleSeeMore}
                    >
                      {loadingMore ? "Loading…" : "See more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
