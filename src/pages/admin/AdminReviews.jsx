import "../../styles/admin-return.css";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  fetchAdminReviews,
  patchAdminReview,
} from "../../features/admin/adminAPI";

import StarRating from "../../features/catalog/reviews/components/StarRating.jsx";

const PAGE_SIZE = 10;

const TABS = [
  { value: "", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminReviews() {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(
    async () => {

      setLoading(true);
      setError("");

      try {

        const data = await fetchAdminReviews({
          page,
          pageSize: PAGE_SIZE,
          status,
          search,
        });

        setReviews(
          data.results || [],
        );

        setTotalPages(
          data.total_pages || 1,
        );
      } catch {

        setError(
          "Could not load reviews.",
        );
      } finally {

        setLoading(false);
      }
    },
    [page, status, search],
  );

  useEffect(() => {

    load();
  }, [load]);

  const moderate = async (
    reviewId,
    nextStatus,
  ) => {

    setBusyId(reviewId);

    try {

      await patchAdminReview(
        reviewId,
        {
          status: nextStatus,
        },
      );

      toast.success(
        "Review updated.",
      );

      await load();
    } catch {

      toast.error(
        "Could not update review.",
      );
    } finally {

      setBusyId(null);
    }
  };

  return (

    <div className="admin-returns-page">

      <header className="admin-returns-header">

        <h1>
          Product reviews
        </h1>

        <p>
          Approve or reject customer product reviews.
        </p>
      </header>

      <div className="admin-returns-toolbar">

        <input
          type="search"
          placeholder="Search product, email, text…"
          value={search}
          onChange={(e) => {

            setSearch(
              e.target.value,
            );

            setPage(1);
          }}
        />

        <div className="admin-returns-tabs">

          {
            TABS.map(
              (tab) => (

                <button
                  key={tab.value || "all"}
                  type="button"
                  className={
                    status === tab.value
                      ? "is-active"
                      : ""
                  }
                  onClick={() => {

                    setStatus(
                      tab.value,
                    );

                    setPage(1);
                  }}
                >
                  {tab.label}
                </button>
              ),
            )
          }
        </div>
      </div>

      {
        loading && (

          <p>
            Loading…
          </p>
        )
      }

      {
        error && (

          <p className="admin-returns-error">
            {error}
          </p>
        )
      }

      {
        !loading &&
        !error &&
        reviews.length === 0 && (

          <p>
            No reviews found.
          </p>
        )
      }

      <div className="admin-returns-list">

        {
          reviews.map(
            (review) => (

              <article
                key={review.id}
                className="admin-returns-card"
              >

                <div className="admin-returns-card-head">

                  <div>

                    <strong>
                      {review.product_name}
                    </strong>

                    <p>
                      {review.user_display}
                      {" · "}
                      {review.status}
                    </p>
                  </div>

                  <StarRating
                    value={review.rating}
                    size={14}
                  />
                </div>

                {
                  review.title && (

                    <p>
                      <strong>
                        {review.title}
                      </strong>
                    </p>
                  )
                }

                <p>
                  {review.body}
                </p>

                <div className="admin-returns-actions">

                  {
                    review.status !== "approved" && (

                      <button
                        type="button"
                        disabled={busyId === review.id}
                        onClick={() => {

                          moderate(
                            review.id,
                            "approved",
                          );
                        }}
                      >
                        Approve
                      </button>
                    )
                  }

                  {
                    review.status !== "rejected" && (

                      <button
                        type="button"
                        disabled={busyId === review.id}
                        onClick={() => {

                          moderate(
                            review.id,
                            "rejected",
                          );
                        }}
                      >
                        Reject
                      </button>
                    )
                  }
                </div>
              </article>
            ),
          )
        }
      </div>

      {
        totalPages > 1 && (

          <div className="admin-returns-pagination">

            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {

                setPage(
                  (p) => p - 1,
                );
              }}
            >
              Previous
            </button>

            <span>
              Page
              {" "}
              {page}
              {" "}
              of
              {" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => {

                setPage(
                  (p) => p + 1,
                );
              }}
            >
              Next
            </button>
          </div>
        )
      }
    </div>
  );
}
