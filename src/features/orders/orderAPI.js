import api from "../../services/api";

export async function createOrderApi(body) {

  const response = await api.post(
    "orders/",
    body,
  );

  return response.data;
}

export async function fetchOrderApi(orderNumber) {

  const response = await api.get(
    `orders/${encodeURIComponent(orderNumber)}/`,
  );

  return response.data;
}
