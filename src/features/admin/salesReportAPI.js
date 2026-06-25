import api from "../../services/api";

/**
 * Admin sales report (`GET /api/admin/reports/sales/`).
 */

function buildReportQueryParams(
  {
    period = "weekly",
    dateFrom = "",
    dateTo = "",
    page,
    pageSize,
    format,
    exportType,
  } = {},
) {

  const params = new URLSearchParams();

  params.set(
    "period",
    period,
  );

  if (
    page != null
  ) {

    params.set(
      "page",
      String(
        page,
      ),
    );
  }

  if (
    pageSize != null
  ) {

    params.set(
      "page_size",
      String(
        pageSize,
      ),
    );
  }

  if (
    period === "custom"
  ) {

    if (
      dateFrom
    ) {

      params.set(
        "date_from",
        dateFrom,
      );
    }

    if (
      dateTo
    ) {

      params.set(
        "date_to",
        dateTo,
      );
    }
  }

  if (
    format
  ) {

    params.set(
      "export_format",
      format,
    );
  }

  if (
    exportType
  ) {

    params.set(
      "export",
      exportType,
    );
  }

  return params;
}

async function downloadReportFile(
  endpoint,
  params,
  defaultFilename,
) {

  const response = await api.get(
    `${endpoint}?${params.toString()}`,
    {
      responseType: "blob",
    },
  );

  const blob = response.data;

  const ct = (
    response.headers["content-type"] ||
    ""
  ).toLowerCase();

  const isPdf = ct.includes(
    "application/pdf",
  );

  const isExcel = ct.includes(
    "spreadsheetml",
  ) || ct.includes(
    "application/vnd.ms-excel",
  );

  if (
    !isPdf &&
    !isExcel
  ) {

    let message = "Could not download file.";

    try {

      const text = await blob.text();

      const parsed = JSON.parse(
        text,
      );

      message = (

        parsed.detail ||

        parsed.error ||

        parsed.message ||

        message
      );
    } catch {

      /* keep default message */
    }

    throw new Error(
      message,
    );
  }

  const disposition = response.headers[
    "content-disposition"
  ] || "";

  const match = disposition.match(
    /filename="([^"]+)"/i,
  );

  const filename = match?.[1] || defaultFilename;

  const href = window.URL.createObjectURL(
    blob,
  );

  const link = document.createElement(
    "a",
  );

  link.href = href;

  link.download = filename;

  document.body.appendChild(
    link,
  );

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    href,
  );
}

export async function fetchAdminSalesReport(
  {
    period = "weekly",
    dateFrom = "",
    dateTo = "",
    page = 1,
    pageSize = 10,
  } = {},
) {

  const params = buildReportQueryParams(
    {
      period,
      dateFrom,
      dateTo,
      page,
      pageSize,
    },
  );

  const res = await api.get(
    `admin/reports/sales/?${params.toString()}`,
  );

  return res.data;
}

export async function downloadAdminSalesReportExport(
  {
    period = "weekly",
    dateFrom = "",
    dateTo = "",
    format = "pdf",
  } = {},
) {

  const params = buildReportQueryParams(
    {
      period,
      dateFrom,
      dateTo,
      format,
    },
  );

  const ext = format === "pdf"
    ? "pdf"
    : "xlsx";

  await downloadReportFile(
    "admin/reports/sales/",
    params,
    `FurniCart-sales-report.${ext}`,
  );
}

export async function downloadAdminLedgerExport(
  {
    period = "weekly",
    dateFrom = "",
    dateTo = "",
    format = "excel",
  } = {},
) {

  const params = buildReportQueryParams(
    {
      period,
      dateFrom,
      dateTo,
      format,
      exportType: "ledger",
    },
  );

  const ext = format === "pdf"
    ? "pdf"
    : "xlsx";

  await downloadReportFile(
    "admin/dashboard/analytics/",
    params,
    `FurniCart-ledger.${ext}`,
  );
}

export async function fetchDashboardAnalytics(
  chartPeriod = "monthly",
) {

  const params = new URLSearchParams();

  params.set(
    "chart_period",
    chartPeriod,
  );

  const res = await api.get(
    `admin/dashboard/analytics/?${params.toString()}`,
  );

  return res.data;
}
