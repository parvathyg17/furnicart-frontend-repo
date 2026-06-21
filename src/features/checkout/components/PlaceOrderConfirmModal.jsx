import Modal from "../../../components/common/Modal.jsx";

import {
  formatMoney,
} from "../../../utils/currency.js";

export default function PlaceOrderConfirmModal(
  {
    open,
    cartData,
    addresses,
    selectedAddressId,
    pricingPreview,
    taxNum,
    shipNum,
    discountNum,
    grandNum,
    gstPct,
    placeBusy,
    placeError,
    onClose,
    onConfirm,
  },
) {

  if (
    !open ||
    !cartData?.items?.length
  ) {

    return null;
  }

  const addr = addresses.find(
    (a) =>
      a.id === selectedAddressId,
  );

  return (

    <Modal
      open={open}
      onRequestClose={() => {

        if (!placeBusy) {

          onClose();
        }
      }}
      busy={placeBusy}
      ariaLabelledBy="checkout-confirm-title"
    >

      <h2
        id="checkout-confirm-title"
        className="checkout-panel-title artisan-font-serif"
        style={{ marginTop: 0 }}
      >
        Confirm your order
      </h2>

      <p className="order-cancel-dialog-hint">
        Are you sure you want to place this order? You will pay cash on delivery
        when your furniture arrives.
      </p>

      {
        addr
          ? (

            <div className="checkout-confirm-block">

              <strong>
                Deliver to
              </strong>

              <p className="checkout-confirm-address">

                {addr.name}
                {" · "}
                {addr.phone}

                <br />

                {
                  [
                    addr.address_line,
                    addr.city,
                    `${addr.state} ${addr.pincode}`,
                  ].filter(Boolean).join(
                    ", ",
                  )
                }
              </p>
            </div>
          )
          : null
      }

      <div className="checkout-confirm-block">

        <strong>
          Items
        </strong>

        <ul className="checkout-confirm-items">

          {
            cartData.items.map(
              (row) => (

                <li
                  key={row.id}
                  className="checkout-confirm-item"
                >

                  <span>
                    {row.product_name}
                    {" "}
                    ×
                    {" "}
                    {row.quantity}
                  </span>

                  <span>
                    ₹
                    {formatMoney(
                      row.line_subtotal,
                    )}
                  </span>
                </li>
              ),
            )
          }
        </ul>
      </div>

      <div className="checkout-confirm-totals">

        <div className="checkout-confirm-total-row">

          <span>
            Subtotal
          </span>

          <span>
            ₹
            {formatMoney(
              cartData.subtotal,
            )}
          </span>
        </div>

        <div className="checkout-confirm-total-row">

          <span>
            {
              gstPct != null
                ? `GST (${gstPct}%)`
                : "GST"
            }
          </span>

          <span>
            ₹
            {formatMoney(
              taxNum,
            )}
          </span>
        </div>

        <div className="checkout-confirm-total-row">

          <span>
            Shipping
          </span>

          <span>
            {
              pricingPreview?.shipping_tier ===
              "free_over_threshold"
                ? "Free"
                : `₹${formatMoney(
                  shipNum,
                )}`
            }
          </span>
        </div>

        {
          discountNum > 0 && (

            <div className="checkout-confirm-total-row">

              <span>
                Discounts
                {
                  pricingPreview?.coupon?.code
                    ? ` (${pricingPreview.coupon.code})`
                    : ""
                }
              </span>

              <span>
                −₹
                {formatMoney(
                  discountNum,
                )}
              </span>
            </div>
          )
        }

        <div className="checkout-confirm-total-row checkout-confirm-grand">

          <span>
            Order total
          </span>

          <span>
            ₹
            {formatMoney(
              grandNum,
            )}
          </span>
        </div>
      </div>

      {
        placeError && (

          <p
            className="shop-banner error cart-bag-banner"
            style={{ marginBottom: "0.75rem" }}
            role="alert"
          >
            {placeError}
          </p>
        )
      }

      <div className="order-cancel-dialog-actions">

        <button
          type="button"
          className="checkout-btn-secondary"
          disabled={placeBusy}
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          type="button"
          className="checkout-btn-primary"
          disabled={placeBusy}
          onClick={onConfirm}
        >
          {placeBusy ? "Placing order…" : "Yes, place order"}
        </button>
      </div>
    </Modal>
  );
}
