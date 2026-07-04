import {
  useCallback,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import Pagination from "../../../../components/common/Pagination.jsx";

import {
  formatProductApiError,
} from "../../../../utils/productApiErrors.js";

import {
  createProductReview,
  deleteProductReview,
  fetchProductReviews,
  updateProductReview,
} from "../reviewAPI.js";

import ReviewCard from "./ReviewCard.jsx";
import ReviewFormModal from "./ReviewFormModal.jsx";
import StarRating from "./StarRating.jsx";


function buildPageNumbers(
  current,
  total,
) {

  if (total <= 1) return [1];

  const pages = new Set([
    1,
    total,
    current,
    current - 1,
    current + 1,
  ]);

  return [...pages]
    .filter(
      (n) => n >= 1 && n <= total,
    )
    .sort(
      (a, b) => a - b,
    );
}


export default function ProductDetailReviews(
  {
    product,
    user,
    onProductRefresh,
    openReviewOnLoad = false,
  },
) {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    count: 0,
    totalPages: 1,
    currentPage: 1,
    next: null,
    previous: null,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalBusy, setModalBusy] = useState(false);
  const [modalError, setModalError] = useState("");
  const [hasOpenedOnLoad, setHasOpenedOnLoad] = useState(false);

  const loadReviews = useCallback(
    async (page = 1) => {

      setLoading(true);
      setError("");

      try {

        const data = await fetchProductReviews(
          product.slug,
          {
            page,
            page_size: 5,
          },
        );

        setReviews(
          data.results || [],
        );

        setPagination({
          count: data.count || 0,
          totalPages: data.total_pages || 1,
          currentPage: data.current_page || 1,
          next: data.next,
          previous: data.previous,
        });
      } catch (err) {

        setError(

          formatProductApiError(
            err.response?.data,
          ) ||

            "Could not load reviews.",
        );
      } finally {

        setLoading(false);
      }
    },
    [product.slug],
  );

  useEffect(() => {

    loadReviews(1);
  }, [loadReviews]);

  useEffect(() => {

    if (
      !openReviewOnLoad ||
      !user ||
      hasOpenedOnLoad
    ) {

      return;
    }

    if (
      product.can_review ||
      product.user_review
    ) {

      setModalOpen(true);
      setHasOpenedOnLoad(true);
    }
  }, [
    openReviewOnLoad,
    user,
    product.can_review,
    product.user_review,
    hasOpenedOnLoad,
  ]);

  const handleSubmitReview = async (
    payload,
  ) => {

    if (!user) return;

    setModalBusy(true);
    setModalError("");

    try {

      if (product.user_review?.id) {

        await updateProductReview(
          product.user_review.id,
          payload,
        );

        toast.success(
          "Review updated.",
        );
      } else {

        await createProductReview(
          product.slug,
          payload,
        );

        toast.success(
          "Thank you for your review.",
        );
      }

      setModalOpen(false);

      await onProductRefresh?.();

      await loadReviews(1);
    } catch (err) {

      setModalError(

        formatProductApiError(
          err.response?.data,
        ) ||

          "Could not save review.",
      );
    } finally {

      setModalBusy(false);
    }
  };

  const handleDeleteReview = async () => {

    if (
      !user ||
      !product.user_review?.id
    ) {

      return;
    }

    const confirmed = window.confirm(
      "Delete your review?",
    );

    if (!confirmed) return;

    try {

      await deleteProductReview(
        product.user_review.id,
      );

      toast.success(
        "Review deleted.",
      );

      await onProductRefresh?.();

      await loadReviews(1);
    } catch (err) {

      toast.error(

        formatProductApiError(
          err.response?.data,
        ) ||

          "Could not delete review.",
      );
    }
  };

  const pageNumbers = buildPageNumbers(
    pagination.currentPage,
    pagination.totalPages,
  );

  const canWrite =
    user &&
    (
      product.can_review ||
      product.user_review
    );

  return (

    <section
      className="fc-reviews-section pd-section"
      aria-label="Customer reviews"
    >

      <div className="fc-reviews-head">

        <div>

          <h2 className="artisan-font-serif fc-reviews-title">
            Customer reviews
          </h2>

          {
            (product.review_count || 0) > 0 && (

              <div className="pd-rating fc-reviews-summary">

                <StarRating
                  value={product.average_rating}
                  size={18}
                />

                <span>
                  {product.average_rating}
                  {" "}
                  ·
                  {" "}
                  {product.review_count}
                  {" "}
                  review
                  {product.review_count === 1
                    ? ""
                    : "s"}
                </span>
              </div>
            )
          }
        </div>

        {
          canWrite && (

            <div className="fc-reviews-actions">

              <button
                type="button"
                className="checkout-btn-secondary"
                onClick={() => {

                  setModalError("");
                  setModalOpen(true);
                }}
              >
                {
                  product.user_review
                    ? "Edit review"
                    : "Write a review"
                }
              </button>

              {
                product.user_review && (

                  <button
                    type="button"
                    className="order-cancel-line-btn"
                    onClick={handleDeleteReview}
                  >
                    Delete
                  </button>
                )
              }
            </div>
          )
        }
      </div>

      {
        loading && (

          <p className="artisan-muted">
            Loading reviews…
          </p>
        )
      }

      {
        error && (

          <div
            className="artisan-banner error"
            role="alert"
          >
            {error}
          </div>
        )
      }

      {
        !loading &&
        !error &&
        reviews.length === 0 && (

          <p className="artisan-muted">
            No reviews yet.
            {
              product.can_review &&
              user &&
              " Be the first to share your experience."
            }
          </p>
        )
      }

      <div className="fc-review-list">

        {
          reviews.map(
            (review) => (

              <ReviewCard
                key={review.id}
                review={review}
              />
            ),
          )
        }
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        pageNumbers={pageNumbers}
        hasPrevious={Boolean(pagination.previous)}
        hasNext={Boolean(pagination.next)}
        onPageChange={(page) => {

          loadReviews(page);
        }}
      />

      <ReviewFormModal
        open={modalOpen}
        onClose={() => {

          if (!modalBusy) {

            setModalOpen(false);
          }
        }}
        onSubmit={handleSubmitReview}
        busy={modalBusy}
        error={modalError}
        initialReview={product.user_review}
        productName={product.name}
      />
    </section>
  );
}
