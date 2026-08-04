import { Star } from "lucide-react";

export default function StarRating({
  value = 0,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  label,
}) {
  const rounded = Math.round(Number(value) || 0);

  return (
    <div
      className={
        interactive
          ? "fc-star-rating fc-star-rating--interactive"
          : "fc-star-rating"
      }
      role={interactive ? "radiogroup" : "img"}
      aria-label={label || `${rounded} out of ${max} stars`}
    >
      {Array.from(
        {
          length: max,
        },
        (_, index) => {
          const starValue = index + 1;
          const filled = starValue <= rounded;

          if (interactive) {
            return (
              <button
                key={starValue}
                type="button"
                className={filled ? "fc-star-btn is-filled" : "fc-star-btn"}
                aria-label={`${starValue} star`}
                onClick={() => {
                  onChange?.(starValue);
                }}
              >
                <Star size={size} fill={filled ? "currentColor" : "none"} />
              </button>
            );
          }

          return (
            <span
              key={starValue}
              className={
                filled ? "fc-star-display is-filled" : "fc-star-display"
              }
              aria-hidden
            >
              <Star size={size} fill={filled ? "currentColor" : "none"} />
            </span>
          );
        },
      )}
    </div>
  );
}
