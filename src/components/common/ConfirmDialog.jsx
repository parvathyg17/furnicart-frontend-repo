import Modal from "./Modal.jsx";

/**
 * Two-action confirmation pattern on top of {@link Modal}.
 */
export default function ConfirmDialog(
  {
    open,
    titleId,
    title,
    hint,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    busy = false,
    error,
    children,
  },
) {

  return (

    <Modal
      open={open}
      onRequestClose={onCancel}
      busy={busy}
      ariaLabelledBy={titleId}
    >

      <h2
        id={titleId}
        className="checkout-panel-title artisan-font-serif"
        style={{ marginTop: 0 }}
      >

        {title}
      </h2>

      {
        hint
          ? (

            <p className="order-cancel-dialog-hint">
              {hint}
            </p>
          )
          : null
      }

      {children}

      {
        error
          ? (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
              style={{ marginBottom: "0.75rem" }}
            >
              {error}
            </div>
          )
          : null
      }

      <div className="order-cancel-dialog-actions">

        <button
          type="button"
          className="checkout-btn-secondary"
          disabled={busy}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>

        <button
          type="button"
          className="checkout-btn-primary order-cancel-confirm-btn"
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
