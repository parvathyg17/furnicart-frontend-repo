/**
 * Centered empty / zero-results message with optional action.
 */
export default function EmptyState(
  {
    title,
    description,
    action,
    className = "cart-bag-muted",
  },
) {

  return (

    <div className={className}>

      {
        title
          ? (

            <p style={{ margin: "0 0 0.35rem", fontWeight: 600 }}>
              {title}
            </p>
          )
          : null
      }

      {
        description
          ? (

            <p style={{ margin: 0 }}>
              {description}
            </p>
          )
          : null
      }

      {action}
    </div>
  );
}
