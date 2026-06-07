import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Previous / next + numbered page buttons.
 */
export default function Pagination(
  {
    currentPage,
    totalPages,
    pageNumbers,
    hasPrevious,
    hasNext,
    onPageChange,
    className = "artisan-pagination",
  },
) {

  if (
    totalPages <= 1
  ) {

    return null;
  }

  return (

    <nav
      className={className}
      aria-label="Pagination"
    >

      <button
        type="button"
        className="artisan-page-arrow"
        disabled={!hasPrevious}
        onClick={() => {

          onPageChange(
            Math.max(
              1,
              currentPage - 1,
            ),
          );
        }}
      >

        <ChevronLeft size={18} />
      </button>

      {
        pageNumbers.map(
          (n) => (

            <button
              key={n}
              type="button"
              className={
                n === currentPage
                  ? "artisan-page-num is-current"
                  : "artisan-page-num"
              }
              onClick={() => {

                onPageChange(n);
              }}
            >
              {n}
            </button>
          ),
        )
      }

      <button
        type="button"
        className="artisan-page-arrow"
        disabled={!hasNext}
        onClick={() => {

          onPageChange(
            currentPage + 1,
          );
        }}
      >

        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
