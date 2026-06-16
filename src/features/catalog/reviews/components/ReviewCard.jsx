import {
  formatDateShort,
} from "../../../../utils/date.js";

import StarRating from "./StarRating.jsx";


export default function ReviewCard(
  {
    review,
  },
) {

  return (

    <article className="fc-review-card">

      <div className="fc-review-card-head">

        <div>

          <p className="fc-review-author">
            {review.user_display}
          </p>

          <p className="fc-review-date">
            {formatDateShort(
              review.created_at,
            )}
          </p>
        </div>

        <StarRating
          value={review.rating}
          size={14}
        />
      </div>

      {
        review.title && (

          <h4 className="fc-review-title">
            {review.title}
          </h4>
        )
      }

      <p className="fc-review-body">
        {review.body}
      </p>

      {
        review.variant_name && (

          <p className="fc-review-variant">
            Purchased:
            {" "}
            {review.variant_name}
          </p>
        )
      }
    </article>
  );
}
