/**
 * Accessible overlay dialog shell. Uses existing checkout / order CSS classes by default.
 */
export default function Modal(
  {
    open,
    onRequestClose,
    children,
    overlayClassName = "order-cancel-overlay",
    contentClassName = "order-cancel-dialog",
    busy = false,
    ariaLabelledBy,
  },
) {

  if (!open) {

    return null;
  }

  return (

    <div
      className={overlayClassName}
      role="presentation"
      onClick={() => {

        if (!busy) {

          onRequestClose?.();
        }
      }}
    >

      <div
        className={contentClassName}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        onClick={(e) => {

          e.stopPropagation();
        }}
      >

        {children}
      </div>
    </div>
  );
}
