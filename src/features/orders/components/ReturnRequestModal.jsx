import Modal from "../../../components/common/Modal.jsx";

import {
  DELIVERY_CHARGE_NON_REFUNDABLE_NOTE,
  orderHasPaidDeliveryCharge,
} from "../orderUi.js";

export default function ReturnRequestModal(
  {
    open,
    returnReason,
    onReturnReasonChange,
    returnBusy,
    returnModalError,
    onClose,
    onSubmit,
    order,
  },
) {

  return (

    <Modal
      open={open}
      onRequestClose={onClose}
      busy={returnBusy}
      ariaLabelledBy="order-return-title"
    >

      <h2
        id="order-return-title"
        className="checkout-panel-title artisan-font-serif"
        style={{ marginTop: 0 }}
      >
        Request return
      </h2>

      <p className="order-cancel-dialog-hint">
        Returns require a reason. An administrator will review your request
        before stock is adjusted.
      </p>

      {
        orderHasPaidDeliveryCharge(
          order,
        ) && (

          <p className="order-cancel-dialog-policy">
            {DELIVERY_CHARGE_NON_REFUNDABLE_NOTE}
          </p>
        )
      }

      <label
        className="order-cancel-label"
        htmlFor="order-return-reason"
      >
        Reason (required)
      </label>

      <textarea
        id="order-return-reason"
        className="order-cancel-textarea"
        rows={4}
        maxLength={2000}
        value={returnReason}
        onChange={(e) => {

          onReturnReasonChange(
            e.target.value,
          );
        }}
      />

      {
        returnModalError && (

          <div
            className="shop-banner error cart-bag-banner"
            role="alert"
            style={{ marginBottom: "0.75rem" }}
          >
            {returnModalError}
          </div>
        )
      }

      <div className="order-cancel-dialog-actions">

        <button
          type="button"
          className="checkout-btn-secondary"
          disabled={returnBusy}
          onClick={onClose}
        >
          Close
        </button>

        <button
          type="button"
          className="checkout-btn-primary order-cancel-confirm-btn"
          disabled={returnBusy}
          onClick={onSubmit}
        >
          {
            returnBusy
              ? "Submitting…"
              : "Submit return"
          }
        </button>
      </div>
    </Modal>
  );
}
