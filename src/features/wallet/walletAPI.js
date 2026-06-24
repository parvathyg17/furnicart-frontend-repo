import api from "../../services/api";

export async function fetchWalletApi() {

  const response = await api.get(
    "profile/wallet/",
  );

  return response.data;
}

export async function fetchWalletTransactionsApi(
  {
    page = 1,
    pageSize = 10,
    type = "",
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
    type === "credit" ||
    type === "debit"
  ) {

    params.set(
      "type",
      type,
    );
  }

  const response = await api.get(
    `profile/wallet/transactions/?${params.toString()}`,
  );

  return response.data;
}
