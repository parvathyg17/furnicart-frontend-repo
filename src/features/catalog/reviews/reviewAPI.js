import api from "../../../services/api";


export async function fetchProductReviews(
  productRef,
  params = {},
) {

  const enc = encodeURIComponent(
    String(productRef),
  );

  const response = await api.get(
    `products/${enc}/reviews/`,
    {
      params,
    },
  );

  return response.data;
}


export async function fetchReviewEligibility(
  productRef,
) {

  const enc = encodeURIComponent(
    String(productRef),
  );

  const response = await api.get(
    `products/${enc}/review-eligibility/`,
  );

  return response.data;
}


export async function createProductReview(
  productRef,
  payload,
) {

  const enc = encodeURIComponent(
    String(productRef),
  );

  const response = await api.post(
    `products/${enc}/reviews/`,
    payload,
  );

  return response.data;
}


export async function updateProductReview(
  reviewId,
  payload,
) {

  const response = await api.patch(
    `reviews/${reviewId}/`,
    payload,
  );

  return response.data;
}


export async function deleteProductReview(
  reviewId,
) {

  await api.delete(
    `reviews/${reviewId}/`,
  );
}


export async function fetchMyReviews(
  params = {},
) {

  const response = await api.get(
    "reviews/mine/",
    {
      params,
    },
  );

  return response.data;
}


export async function fetchEligibleReviewProducts() {

  const response = await api.get(
    "reviews/eligible/",
  );

  return response.data;
}
