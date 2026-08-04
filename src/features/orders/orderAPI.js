import api from "../../services/api";

export async function createOrderApi(body) {
  const response = await api.post("orders/", body);

  return response.data;
}

export async function fetchOrdersList({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
} = {}) {
  const params = new URLSearchParams();

  params.set("page", String(page));

  params.set("page_size", String(pageSize));

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (status) {
    params.set("status", status);
  }

  const response = await api.get(`orders/?${params.toString()}`);

  return response.data;
}

export async function fetchOrderApi(orderNumber) {
  const response = await api.get(`orders/${encodeURIComponent(orderNumber)}/`, {
    params: {
      _: Date.now(),
    },
  });

  return response.data;
}

export async function cancelOrderApi(orderNumber, body = {}) {
  const response = await api.post(
    `orders/${encodeURIComponent(orderNumber)}/cancel/`,
    body,
  );

  return response.data;
}

export async function cancelOrderLineApi(orderNumber, lineId, body = {}) {
  const response = await api.post(
    `orders/${encodeURIComponent(orderNumber)}/lines/${lineId}/cancel/`,
    body,
  );

  return response.data;
}

export async function fetchPurchasesList({
  page = 1,
  pageSize = 10,
  search = "",
  fulfillmentStatus = "",
  lineStatus = "",
} = {}) {
  const params = new URLSearchParams();

  params.set("page", String(page));

  params.set("page_size", String(pageSize));

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (fulfillmentStatus) {
    params.set("fulfillment_status", fulfillmentStatus);
  }

  if (lineStatus) {
    params.set("line_status", lineStatus);
  }

  const response = await api.get(`orders/purchases/?${params.toString()}`);

  return response.data;
}

export async function submitReturnRequest(orderNumber, lineId, body) {
  const response = await api.post(
    `orders/${encodeURIComponent(orderNumber)}/lines/${lineId}/return/`,
    body,
  );

  return response.data;
}

export async function downloadOrderInvoicePdf(orderNumber) {
  const response = await api.get(
    `orders/${encodeURIComponent(orderNumber)}/invoice/`,
    {
      responseType: "blob",
    },
  );

  const blob = response.data;

  const ct = (response.headers["content-type"] || "").toLowerCase();

  if (!ct.includes("application/pdf")) {
    let message = "Could not download invoice.";

    try {
      const text = await blob.text();

      const parsed = JSON.parse(text);

      message = parsed.detail || parsed.error || parsed.message || message;
    } catch {
      /* keep default message */
    }

    throw new Error(message);
  }

  const href = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = href;

  link.download = `FurniCart-invoice-${String(orderNumber).replace(/[^a-zA-Z0-9._-]+/g, "_")}.pdf`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(href);
}
