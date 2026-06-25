import "../../styles/adminpanel.css";
import "../../styles/admin-dashboard-analytics.css";

import {
  BarChart3,
  Download,
  IndianRupee,
  ShoppingBag,
  UserCheck,
  Users,
  UserX,
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

  const maxRevenue = Math.max(
    ...breakdown.map(
      (
        row,
      ) =>
        Number(
          row.grand_total ?? 0,
        ),
    ),
    1,
  );

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
          ) => {

            const revenue = Number(
              row.grand_total ?? 0,
            );

            const heightPct = Math.max(
              (
                revenue /
                maxRevenue
              ) * 100,
              revenue > 0
                ? 6
                : 0,
            );

            return (

              <div
                key={row.date || row.label}
                className="da-chart-col"
              >

                <div className="da-chart-bar-wrap">

                  <div
                    className="da-chart-bar"
                    style={{
                      height: `${heightPct}%`,
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

function TopList(
  {
    title,
    rows,
    emptyText,
  },
) {

  return (

    <section className="da-top-card">

      <h3>
        {title}
      </h3>

      {
        !rows?.length ? (

          <p className="da-muted">
            {emptyText}
          </p>
        ) : (

          <ol className="da-top-list">

            {
              rows.map(
                (
                  row,
                  index,
                ) => (

                  <li key={`${row.id || row.name}-${index}`}>

                    <span className="da-top-rank">
                      {index + 1}
                    </span>

                    <div className="da-top-info">

                      <strong>
                        {row.name}
                      </strong>

                      <span>
                        {row.quantity_sold}
                        {" "}
                        sold
                      </span>

                    </div>

                    <span className="da-top-revenue">
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

          <span>
            OVERVIEW
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

      <div className="dashboard-cards da-user-cards">

        <div className="dashboard-card">

          <div className="dashboard-icon">

            <Users size={28} />

          </div>

          <div>

            <h4>
              Total Users
            </h4>

            <h2>
              {userStats.total_users}
            </h2>

          </div>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-icon green">

            <UserCheck size={28} />

          </div>

          <div>

            <h4>
              Active Users
            </h4>

            <h2>
              {userStats.active_users}
            </h2>

          </div>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-icon red">

            <UserX size={28} />

          </div>

          <div>

            <h4>
              Blocked Users
            </h4>

            <h2>
              {userStats.blocked_users}
            </h2>

          </div>

        </div>

      </div>

      <div className="dashboard-cards da-sales-cards">

        <div className="dashboard-card">

          <div className="dashboard-icon">

            <ShoppingBag size={28} />

          </div>

          <div>

            <h4>
              Orders
            </h4>

            <h2>
              {salesSummary.order_count}
            </h2>

          </div>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-icon green">

            <IndianRupee size={28} />

          </div>

          <div>

            <h4>
              Gross sales
            </h4>

            <h2>
              ₹
              {formatMoney(
                salesSummary.subtotal_gross,
              )}
            </h2>

          </div>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-icon">

            <BarChart3 size={28} />

          </div>

          <div>

            <h4>
              Net revenue
            </h4>

            <h2>
              ₹
              {formatMoney(
                salesSummary.grand_total,
              )}
            </h2>

          </div>

        </div>

      </div>

      <section className="da-chart-panel">

        <div className="da-panel-head">

          <div>

            <h3>
              Sales trend
            </h3>

            {
              analytics?.date_from && (

                <p className="da-muted">
                  {analytics.date_from}
                  {" "}
                  –
                  {" "}
                  {analytics.date_to}
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

        <TopList
          title="Top products"
          rows={
            analytics?.top_products
          }
          emptyText="No product sales in this window."
        />

        <TopList
          title="Top categories"
          rows={
            analytics?.top_categories
          }
          emptyText="No category sales in this window."
        />

        <TopList
          title="Top brands"
          rows={
            analytics?.top_brands
          }
          emptyText="No brand sales in this window."
        />

      </div>

    </div>
  );
}
