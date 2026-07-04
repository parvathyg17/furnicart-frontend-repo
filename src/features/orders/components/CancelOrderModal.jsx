import Modal from "../../../components/common/Modal.jsx";

import QuantityStepper from "./QuantityStepper.jsx";

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
    cancelQuantity,
    onCancelQuantityChange,
    cancelBusy,
    cancelModalError,
    onClose,
    onConfirm,
    order,
  },
) {

  const cancelLine = cancelTarget?.type === "line"
    ? order?.lines?.find(
      (l) =>
        l.id === cancelTarget.lineId,
    )
    : null;

  const maxCancelQty = cancelLine?.cancellable_quantity ?? 1;

  const showQtyPicker = Boolean(
    cancelLine &&
    maxCancelQty > 1,
  );

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
            : showQtyPicker
              ? "Cancel units?"
              : "Cancel this line?"
        }
      </h2>

      <p className="order-cancel-dialog-hint">

        {
          cancelTarget?.type === "order"
            ? "This cancels every remaining item and restores stock. This cannot be undone."
            : showQtyPicker
              ? "Choose how many units to cancel before shipping. Stock will be restored for those units."
              : "Stock for this item will be restored. If it is your last active item, the whole order will be cancelled."
        }
      </p>

      {
        showQtyPicker && (

          <QuantityStepper
            id="order-cancel-quantity"
            label="Units to cancel"
            value={cancelQuantity}
            min={1}
            max={maxCancelQty}
            disabled={cancelBusy}
            onChange={onCancelQuantityChange}
          />
        )
      }

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
              : showQtyPicker
                ? `Cancel ${Math.min(
                  Math.max(
                    1,
                    Number(
                      cancelQuantity,
                    ) || 1,
                  ),
                  maxCancelQty,
                )} unit(s)`
                : "Confirm cancel"
          }
        </button>
      </div>
    </Modal>
  );
}
