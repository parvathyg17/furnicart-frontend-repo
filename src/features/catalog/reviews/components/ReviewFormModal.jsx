import { useEffect, useState } from "react";

import { X } from "lucide-react";

import StarRating from "./StarRating.jsx";

export default function ReviewFormModal({
  open,
  onClose,
  onSubmit,
  busy,
  error,
  initialReview,
  productName,
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!open) return;

    setRating(initialReview?.rating || 5);

    setTitle(initialReview?.title || "");

    setBody(initialReview?.body || "");
  }, [open, initialReview]);

  if (!open) return null;

  const isEdit = Boolean(initialReview?.id);

  return (
    <div
      className="fc-review-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="fc-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fc-review-modal-title"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="fc-review-modal-head">
          <h2 id="fc-review-modal-title" className="artisan-font-serif">
            {isEdit ? "Edit your review" : "Write a review"}
          </h2>

          <button
            type="button"
            className="fc-review-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {productName && (
          <p className="fc-review-modal-product">{productName}</p>
        )}

        <form
          onSubmit={async (e) => {
            e.preventDefault();

            await onSubmit({
              rating,
              title,
              body,
            });
          }}
        >
          <label className="fc-review-field">
            <span>Rating</span>

            <StarRating
              value={rating}
              size={22}
              interactive
              onChange={setRating}
            />
          </label>

          <label className="fc-review-field">
            <span>Title (optional)</span>

            <input
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </label>

          <label className="fc-review-field">
            <span>Your review</span>

            <textarea
              rows={5}
              maxLength={2000}
              required
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
              }}
            />
          </label>

          {error && (
            <div className="artisan-banner error" role="alert">
              {error}
            </div>
          )}

          <div className="fc-review-modal-actions">
            <button
              type="button"
              className="checkout-btn-secondary"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>

            <button type="submit" className="pd-user-btn-cart" disabled={busy}>
              {busy ? "Saving…" : isEdit ? "Update review" : "Submit review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
