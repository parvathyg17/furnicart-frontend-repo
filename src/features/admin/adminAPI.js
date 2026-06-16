import api from "../../services/api";

export const adminLoginAPI = async (data) => {
  const res = await api.post("admin/login/", data);
  return res.data;
};


export const adminMeAPI = async () => {
  const res = await api.get("admin/me/");
  return res.data;
};


export const getUsersAPI = async (page = 1, search = "") => {
  const res = await api.get(
    `admin/users/?page=${page}&search=${search}`
  );
  return res.data;
};


export const getDashboardStatsAPI =
  async () => {

    const res = await api.get(
      "admin/dashboard-stats/"
    );

    return res.data;
};


export const toggleUserBlockAPI = async (userId) => {
  const res = await api.patch(
    `admin/users/${userId}/block/`
  );
  return res.data;
};


export const adminLogoutAPI = async () => {
  const res = await api.post("admin/logout/");
  return res.data;
};

export async function fetchAdminOrders(
  {
    page = 1,
    pageSize = 10,
    search = "",
    status = "",
    ordering = "-placed_at",
  } = {},
) {

  const params = new URLSearchParams();

  params.set(
    "page",
    String(
      page,
    ),
  );

  params.set(
    "page_size",
    String(
      pageSize,
    ),
  );

  if (
    search.trim()
  ) {

    params.set(
      "search",
      search.trim(),
    );
  }

  if (
    status
  ) {

    params.set(
      "status",
      status,
    );
  }

  if (
    ordering
  ) {

    params.set(
      "ordering",
      ordering,
    );
  }

  const res = await api.get(
    `admin/orders/?${params.toString()}`,
  );

  return res.data;
}

export async function postAdminCancelOrder(
  orderNumber,
  reason = "",
) {

  const res = await api.post(
    `admin/orders/${encodeURIComponent(orderNumber)}/cancel/`,
    {
      reason: reason || "",
    },
  );

  return res.data;
}

export async function fetchAdminInventoryStock(
  {
    page = 1,
    pageSize = 20,
    search = "",
    ordering = "-id",
    lowStock = false,
  } = {},
) {

  const params = new URLSearchParams();

  params.set(
    "page",
    String(
      page,
    ),
  );

  params.set(
    "page_size",
    String(
      pageSize,
    ),
  );

  if (
    search.trim()
  ) {

    params.set(
      "search",
      search.trim(),
    );
  }

  if (
    ordering
  ) {

    params.set(
      "ordering",
      ordering,
    );
  }

  if (
    lowStock
  ) {

    params.set(
      "low_stock",
      "1",
    );
  }

  const res = await api.get(
    `admin/inventory/?${params.toString()}`,
  );

  return res.data;
}

export async function fetchAdminOrder(
  orderNumber,
) {

  const res = await api.get(
    `admin/orders/${encodeURIComponent(orderNumber)}/`,
  );

  return res.data;
}

export async function patchAdminLineFulfillment(
  orderNumber,
  lineId,
  fulfillmentStatus,
) {

  const res = await api.patch(
    `admin/orders/${encodeURIComponent(orderNumber)}/lines/${lineId}/fulfillment/`,
    {
      fulfillment_status: fulfillmentStatus,
    },
  );

  return res.data;
}

export async function fetchAdminReturns(
  {
    page = 1,
    pageSize = 10,
    status = "",
    search = "",
  } = {},
) {

  const params = new URLSearchParams();

  params.set(
    "page",
    String(
      page,
    ),
  );

  params.set(
    "page_size",
    String(
      pageSize,
    ),
  );

  if (
    status
  ) {

    params.set(
      "status",
      status,
    );
  }

  if (
    search.trim()
  ) {

    params.set(
      "search",
      search.trim(),
    );
  }

  const res = await api.get(
    `admin/orders/returns/?${params.toString()}`,
  );

  return res.data;
}

export async function patchAdminReturn(
  returnId,
  body,
) {

  const res = await api.patch(
    `admin/orders/returns/${returnId}/`,
    body,
  );

  return res.data;
}


export async function fetchAdminReviews(
  {
    page = 1,
    pageSize = 10,
    status = "",
    search = "",
  } = {},
) {

  const params = new URLSearchParams();

  params.set(
    "page",
    String(page),
  );

  params.set(
    "page_size",
    String(pageSize),
  );

  if (status.trim()) {

    params.set(
      "status",
      status.trim(),
    );
  }

  if (search.trim()) {

    params.set(
      "search",
      search.trim(),
    );
  }

  const res = await api.get(
    `admin/reviews/?${params.toString()}`,
  );

  return res.data;
}


export async function patchAdminReview(
  reviewId,
  body,
) {

  const res = await api.patch(
    `admin/reviews/${reviewId}/`,
    body,
  );

  return res.data;
}

