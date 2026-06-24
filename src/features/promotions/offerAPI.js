import api from "../../services/api";

/**
 * Admin offer API (`/api/admin/offers/`).
 */

export async function fetchAdminOffers(
  {
    page = 1,
    pageSize = 10,
    search = "",
    isActive = "",
    offerType = "",
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

  if (search.trim()) {

    params.set(
      "search",
      search.trim(),
    );
  }

  if (
    isActive === "true"
    ||
    isActive === "false"
  ) {

    params.set(
      "is_active",
      isActive,
    );
  }

  if (
    offerType === "product"
    ||
    offerType === "category"
  ) {

    params.set(
      "offer_type",
      offerType,
    );
  }

  const res = await api.get(
    `admin/offers/?${params.toString()}`,
  );

  return res.data;
}


export async function postAdminOffer(
  body,
) {

  const res = await api.post(
    "admin/offers/",
    body,
  );

  return res.data;
}


export async function patchAdminOffer(
  offerId,
  body,
) {

  const res = await api.patch(
    `admin/offers/${offerId}/`,
    body,
  );

  return res.data;
}


export async function deleteAdminOffer(
  offerId,
) {

  const res = await api.delete(
    `admin/offers/${offerId}/`,
  );

  return res.data;
}
