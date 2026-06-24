import api from "../../services/api";

export async function initiateRazorpayCheckoutApi(
  body,
) {

  const response = await api.post(
    "orders/razorpay/initiate/",
    body,
  );

  return response.data;
}

export async function verifyRazorpayPaymentApi(
  body,
) {

  const response = await api.post(
    "orders/razorpay/verify/",
    body,
  );

  return response.data;
}
