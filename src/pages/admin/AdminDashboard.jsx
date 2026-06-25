import "../../styles/adminpanel.css";
import "../../styles/admin-dashboard-analytics.css";

import {
  BarChart3,
  Ban,
  Download,
  FolderKanban,
  IndianRupee,
  ShoppingBag,
  UserCheck,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  downloadAdminLedgerExport,
  fetchDashboardAnalytics,
} from "../../features/admin/salesReportAPI";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

const CHART_TABS = [
  {
    id: "weekly",
    label: "Last 7 days",
  },
  {
    id: "monthly",
    label: "Last 30 days",
  },
  {
    id: "yearly",
    label: "Year to date",
  },
];

function formatMoney(
  value,
) {

  const n = Number(
    value ?? 0,
  );

  if (
    Number.isNaN(
      n,
    )
  ) {

    return "0.00";
  }

  return n.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function formatChartLabel(
  label,
  granularity,
) {

  if (
    !label
  ) {

    return "—";
  }

  if (
    granularity === "month"
  ) {

    const [
      year,
      month,
    ] = label.split(
      "-",
    );

    const d = new Date(
      Number(
        year,
      ),
      Number(
        month,
      ) - 1,
      1,
    );

    return d.toLocaleDateString(
      undefined,
      {
        month: "short",
        year: "2-digit",
      },
    );
  }

  const d = new Date(
    `${label}T12:00:00`,
  );

  if (
    Number.isNaN(
      d.getTime(),
    )
  ) {

    return label;
  }

  return d.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    },
  );
}

function formatReportDate(
  iso,
) {

  if (!iso) {
    return "—";
  }

  const d = new Date(
    `${iso}T12:00:00`,
  );

  if (Number.isNaN(d.getTime())) {
    return iso;
  }

  return d.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function SalesChart(
  {
    breakdown,
    granularity,
  },
) {

  if (
    !breakdown?.length
  ) {

    return (

      <p className="da-muted">
        No sales in this period.
      </p>
    );
  }

  const revenues = breakdown.map(
    (row) =>
      Number(
        row.grand_total ?? 0,
      ),
  );

  const maxRevenue = Math.max(
    ...revenues,
    1,
  );

  let peakIndex = 0;

  revenues.forEach(
    (value, index) => {

      if (
        value >= revenues[peakIndex]
      ) {

        peakIndex = index;
      }
    },
  );

  let highlightIndex = -1;

  for (
    let i = breakdown.length - 1;
    i >= 0;
    i -= 1
  ) {

    if (
      revenues[i] > 0 &&
      i !== peakIndex
    ) {

      highlightIndex = i;

      break;
    }
  }

  return (

    <div
      className="da-chart"
      role="img"
      aria-label="Sales revenue chart"
    >

      {
        breakdown.map(
          (
            row,
            index,
          ) => {

            const revenue = revenues[index];

            const barHeightPx = Math.max(
              Math.round(
                (revenue / maxRevenue) * 180,
              ),
              revenue > 0 ? 12 : 0,
            );

            const barClass = [
              "da-chart-bar",
              index === peakIndex
                ? "is-peak"
                : "",
              index === highlightIndex
                ? "is-peach"
                : "",
            ].filter(Boolean).join(" ");

            return (

              <div
                key={row.date || row.label}
                className="da-chart-col"
              >

                <div className="da-chart-bar-wrap">

                  <div
                    className={barClass}
                    style={{
                      height: `${barHeightPx}px`,
                    }}
                    title={`INR ${formatMoney(revenue)}`}
                  />

                </div>

                <span className="da-chart-label">
                  {formatChartLabel(
                    row.label,
                    granularity,
                  )}
                </span>

              </div>
            );
          },
        )
      }
    </div>
  );
}

function MetricCard(
  {
    label,
    value,
    icon: Icon,
    tone = "default",
  },
) {

  return (

    <article className="da-metric-card">

      <div className={`da-metric-icon ${tone !== "default" ? `is-${tone}` : ""}`}>

        <Icon size={20} strokeWidth={1.75} />
      </div>

      <div className="da-metric-body">

        <h4>
          {label}
        </h4>

        <strong>
          {value}
        </strong>

      </div>
    </article>
  );
}

function TopProductsPanel(
  {
    rows,
  },
) {

  return (

    <section className="da-top-card">

      <div className="da-top-card-head">

        <h3>
          Top Products
        </h3>

        <span className="da-top-pill">
          Sorted by sales
        </span>

      </div>

      {
        !rows?.length ? (

          <p className="da-muted">
            No product sales in this window.
          </p>
        ) : (

          <ol className="da-product-list">

            {
              rows.map(
                (
                  row,
                  index,
                ) => (

                  <li key={`${row.id || row.name}-${index}`}>

                    <div className="da-product-thumb" aria-hidden>

                      {(row.name || "?").charAt(0).toUpperCase()}
                    </div>

                    <div className="da-product-info">

                      <strong>
                        {row.name}
                      </strong>

                      <span>
                        {row.quantity_sold}
                        {" "}
                        sold
                      </span>

                    </div>

                    <span className="da-product-revenue">
                      ₹
                      {formatMoney(
                        row.revenue,
                      )}
                    </span>

                  </li>
                ),
              )
            }
          </ol>
        )
      }
    </section>
  );
}

function TopCategoriesPanel(
  {
    rows,
  },
) {

  const maxRevenue = Math.max(
    ...(
      rows || []
    ).map(
      (row) =>
        Number(
          row.revenue ?? 0,
        ),
    ),
    1,
  );

  return (

    <section className="da-top-card">

      <div className="da-top-card-head">

        <h3>
          Top Categories
        </h3>

      </div>

      {
        !rows?.length ? (

          <p className="da-muted">
            No category sales in this window.
          </p>
        ) : (

          <ul className="da-category-list">

            {
              rows.map(
                (
                  row,
                  index,
                ) => {

                  const revenue = Number(
                    row.revenue ?? 0,
                  );

                  const widthPct = Math.max(
                    (revenue / maxRevenue) * 100,
                    revenue > 0 ? 8 : 0,
                  );

                  return (

                    <li key={`${row.id || row.name}-${index}`}>

                      <div className="da-category-row">

                        <span className="da-category-icon" aria-hidden>

                          <FolderKanban size={16} />
                        </span>

                        <span className="da-category-name">
                          {row.name}
                        </span>

                        <span className="da-category-meta">
                          ₹
                          {formatMoney(revenue)}
                          {" "}
                          (
                          {row.quantity_sold}
                          {" "}
                          sold)
                        </span>

                      </div>

                      <div className="da-category-bar">

                        <span style={{ width: `${widthPct}%` }} />

                      </div>

                    </li>
                  );
                },
              )
            }
          </ul>
        )
      }

    </section>
  );
}

export default function AdminDashboard() {

  const [
    chartPeriod,
    setChartPeriod,
  ] = useState(
    "monthly",
  );

  const [
    loadingLocal,
    setLoadingLocal,
  ] = useState(
    false,
  );

  const [
    exporting,
    setExporting,
  ] = useState(
    "",
  );

  const [
    analytics,
    setAnalytics,
  ] = useState(
    null,
  );

  const lastSigRef = useRef(
    null,
  );

  const loadAnalytics =
    useCallback(
      async (
        { silent = false } = {},
      ) => {

        if (!silent) {

          setLoadingLocal(
            true,
          );
        }

        try {

          const data =
            await fetchDashboardAnalytics(
              chartPeriod,
            );

          const snap =
            stableStringify(
              data,
            );

          if (
            silent &&
            lastSigRef.current ===
              snap
          ) {

            return;
          }

          lastSigRef.current =
            snap;

          setAnalytics(
            data,
          );
        } catch {

          if (!silent) {

            toast.error(
              "Failed to load dashboard analytics",
            );
          }
        } finally {

          if (!silent) {

            setLoadingLocal(
              false,
            );
          }
        }
      },

      [
        chartPeriod,
      ],
    );

  useEffect(
    () => {

      loadAnalytics();
    },

    [loadAnalytics],
  );

  useBackgroundServerSync(
    {

      enabled: true,

      pollIntervalMs: 120_000,

      onRefresh:
        () =>
          loadAnalytics(
            {
              silent: true,
            },
          ),
    },
  );

  const handleLedgerExport = async (
    format,
  ) => {

    if (
      !analytics
    ) {

      return;
    }

    setExporting(
      format,
    );

    try {

      const ledgerPeriod =
        chartPeriod === "monthly"
          ? "custom"
          : chartPeriod;

      await downloadAdminLedgerExport(
        {
          period: ledgerPeriod,
          dateFrom:
            chartPeriod === "monthly"
              ? analytics.date_from
              : "",
          dateTo:
            chartPeriod === "monthly"
              ? analytics.date_to
              : "",
          format,
        },
      );

      toast.success(
        format === "pdf"
          ? "Ledger PDF downloaded."
          : "Ledger Excel downloaded.",
      );
    } catch (err) {

      toast.error(
        err?.message ||
          "Ledger export failed.",
      );
    } finally {

      setExporting(
        "",
      );
    }
  };

  if (
    loadingLocal &&
    !analytics
  ) {

    return (
      <div className="loading-cell">
        Loading dashboard...
      </div>
    );
  }

  const userStats =
    analytics?.user_stats || {

      total_users: 0,
      active_users: 0,
      blocked_users: 0,
    };

  const salesSummary =
    analytics?.sales_summary || {

      order_count: 0,
      subtotal_gross: "0.00",
      grand_total: "0.00",
    };

  return (

    <div className="da-page">

      <div className="dashboard-header da-header">

        <div>

          <span className="da-header-eyebrow">
            Overview
          </span>

          <h2>
            Dashboard Analytics
          </h2>

        </div>

        <div className="da-period-tabs">

          {
            CHART_TABS.map(
              (
                tab,
              ) => (

                <button
                  key={tab.id}
                  type="button"
                  className={
                    chartPeriod === tab.id
                      ? "is-active"
                      : ""
                  }
                  onClick={() =>
                    setChartPeriod(
                      tab.id,
                    )}
                >
                  {tab.label}
                </button>
              ),
            )
          }
        </div>

      </div>

      <div className="da-metrics-grid">

        <MetricCard
          label="Total Users"
          value={String(userStats.total_users)}
          icon={Users}
        />

        <MetricCard
          label="Active Users"
          value={String(userStats.active_users)}
          icon={UserCheck}
          tone="green"
        />

        <MetricCard
          label="Blocked Users"
          value={String(userStats.blocked_users)}
          icon={Ban}
          tone="red"
        />

        <MetricCard
          label="Orders"
          value={String(salesSummary.order_count)}
          icon={ShoppingBag}
          tone="peach"
        />

        <MetricCard
          label="Gross Sales"
          value={`₹${formatMoney(salesSummary.subtotal_gross)}`}
          icon={IndianRupee}
        />

        <MetricCard
          label="Net Revenue"
          value={`₹${formatMoney(salesSummary.grand_total)}`}
          icon={BarChart3}
        />

      </div>

      <section className="da-chart-panel">

        <div className="da-panel-head">

          <div>

            <h3>
              Sales Trend
            </h3>

            {
              analytics?.date_from && (

                <p className="da-muted">
                  Report period:
                  {" "}
                  {formatReportDate(analytics.date_from)}
                  {" "}
                  –
                  {" "}
                  {formatReportDate(analytics.date_to)}
                </p>
              )
            }
          </div>

          <div className="da-ledger-actions">

            <button
              type="button"
              className="da-ledger-btn"
              disabled={!!exporting}
              onClick={() =>
                handleLedgerExport(
                  "pdf",
                )}
            >
              <Download size={15} />
              {
                exporting === "pdf"
                  ? "Exporting…"
                  : "Ledger PDF"
              }
            </button>

            <button
              type="button"
              className="da-ledger-btn"
              disabled={!!exporting}
              onClick={() =>
                handleLedgerExport(
                  "excel",
                )}
            >
              <Download size={15} />
              {
                exporting === "excel"
                  ? "Exporting…"
                  : "Ledger Excel"
              }
            </button>

          </div>

        </div>

        <SalesChart
          breakdown={
            analytics?.sales_chart || []
          }
          granularity={
            analytics?.breakdown_granularity || "day"
          }
        />

      </section>

      <div className="da-top-grid">

        <TopProductsPanel
          rows={
            analytics?.top_products
          }
        />

        <TopCategoriesPanel
          rows={
            analytics?.top_categories
          }
        />

      </div>

    </div>
  );
}
