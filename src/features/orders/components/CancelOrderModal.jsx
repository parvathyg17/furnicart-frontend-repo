import Modal from "../../../components/common/Modal.jsx";

import {
  DELIVERY_CHARGE_NON_REFUNDABLE_NOTE,
  orderHasPaidDeliveryCharge,
} from "../orderUi.js";

export default function CancelOrderModal(
  {
    open,
    cancelTarget,
    cancelReason,
    onCancelReasonChange,
    cancelBusy,
    cancelModalError,
    onClose,
    onConfirm,
    order,
  },
) {

  return (

    <Modal
      open={open}
      onRequestClose={onClose}
      busy={cancelBusy}
      ariaLabelledBy="order-cancel-title"
    >

      <h2
        id="order-cancel-title"
        className="checkout-panel-title artisan-font-serif"
        style={{ marginTop: 0 }}
      >

        {
          cancelTarget?.type === "order"
            ? "Cancel entire order?"
            : "Cancel this line?"
        }
      </h2>

      <p className="order-cancel-dialog-hint">

        {
          cancelTarget?.type === "order"
            ? "This cancels every item and restores stock. This cannot be undone."
            : "Stock for this item will be restored. If it is your last active item, the whole order will be cancelled."
        }
      </p>

      {
        orderHasPaidDeliveryCharge(
          order,
        ) &&
        cancelTarget?.type === "line" && (

          <p className="order-cancel-dialog-policy">
            {DELIVERY_CHARGE_NON_REFUNDABLE_NOTE}
          </p>
        )
      }

      <label
        className="order-cancel-label"
        htmlFor="order-cancel-reason"
      >
        Reason (optional)
      </label>

      <textarea
        id="order-cancel-reason"
        className="order-cancel-textarea"
        rows={3}
        maxLength={500}
        value={cancelReason}
        onChange={(e) => {

          onCancelReasonChange(
            e.target.value,
          );
        }}
        placeholder="Tell us why (optional)"
      />

      {
        cancelModalError && (

          <div
            className="shop-banner error cart-bag-banner"
            role="alert"
            style={{ marginBottom: "0.75rem" }}
          >
            {cancelModalError}
          </div>
        )
      }

      <div className="order-cancel-dialog-actions">

        <button
          type="button"
          className="checkout-btn-secondary"
          disabled={cancelBusy}
          onClick={onClose}
        >
          Keep order
        </button>

        <button
          type="button"
          className="checkout-btn-primary order-cancel-confirm-btn"
          disabled={cancelBusy}
          onClick={onConfirm}
        >
          {
            cancelBusy
              ? "Working…"
              : "Confirm cancel"
          }
        </button>
      </div>
    </Modal>
  );
}
