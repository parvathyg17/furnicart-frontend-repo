import {
  formatMoney,
} from "../../../utils/currency.js";

import {
  PAYMENT_STATUS_LABELS,
  DELIVERY_CHARGE_NON_REFUNDABLE_NOTE,
  showDeliveryChargeNonRefundableNote,
} from "../orderUi.js";

function formatRefundDate(
  iso,
) {

  if (
    !iso
  ) {

    return "—";
  }

  const d = new Date(
    iso,
  );

  if (
    Number.isNaN(
      d.getTime(),
    )
  ) {

    return "—";
  }

  return d.toLocaleString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

export default function OrderRefundSummary(
  {
    order,
  },
) {

  const refundedNum = Number(
    order.refunded_total ?? 0,
  );

  if (
    refundedNum <= 0
  ) {

    return null;
  }

  const cancelRefundNum = Number(
    order.cancel_refund_total ?? 0,
  );

  const returnRefundNum = Number(
    order.return_refund_total ?? 0,
  );

  const originalPaidNum = Number(
    order.original_paid ?? order.grand_total,
  );

  const remainingValueNum = Number(
    order.remaining_value ?? order.grand_total,
  );

  const refundTxns = order.refund_transactions || [];

  const cancelledCount = (order.lines || []).filter(
    (line) => line.status === "cancelled",
  ).length;

  const refundStatusLabel =
    order.payment_status === "refunded"
      ? PAYMENT_STATUS_LABELS.refunded
      : PAYMENT_STATUS_LABELS.partially_refunded;

  const refundStatusClass =
    order.payment_status === "refunded"
      ? "odl-refund-pill--full"
      : "odl-refund-pill--partial";

  return (

    <div className="odl-refund-card">

      <h3>
        Refund summary
      </h3>

      <div className="odl-refund-rows">

        <div className="odl-refund-row">

          <span>
            Total refund amount
          </span>

          <span className="odl-refund-amt">
            ₹
            {formatMoney(
              refundedNum,
            )}
          </span>
        </div>

        <div className="odl-refund-row">

          <span>
            Refund status
          </span>

          <span className={`odl-refund-pill ${refundStatusClass}`}>
            {refundStatusLabel}
          </span>
        </div>

        {
          cancelRefundNum > 0 && (

            <div className="odl-refund-row odl-refund-row--muted">

              <span>
                Cancellation refunds
              </span>

              <span>
                ₹
                {formatMoney(
                  cancelRefundNum,
                )}
              </span>
            </div>
          )
        }

        {
          returnRefundNum > 0 && (

            <div className="odl-refund-row odl-refund-row--muted">

              <span>
                Return refunds
              </span>

              <span>
                ₹
                {formatMoney(
                  returnRefundNum,
                )}
              </span>
            </div>
          )
        }

        {
          cancelledCount > 0 && (

            <div className="odl-refund-row odl-refund-row--muted">

              <span>
                Cancelled items
              </span>

              <span>
                {cancelledCount}
              </span>
            </div>
          )
        }
      </div>

      {
        refundTxns.length > 0 && (

          <ul className="odl-refund-txns">

            {
              refundTxns.map(
                (txn) => (

                  <li
                    key={txn.id}
                    className="odl-refund-txn"
                  >

                    <div className="odl-refund-txn-top">

                      <span className="odl-refund-txn-amt">
                        ₹
                        {formatMoney(
                          txn.amount,
                        )}
                      </span>

                      <span className="odl-refund-txn-date">
                        {formatRefundDate(
                          txn.created_at,
                        )}
                      </span>
                    </div>

                    <p className="odl-refund-txn-note">
                      {txn.reference_note ||
                        txn.reason_label}
                    </p>
                  </li>
                ),
              )
            }
          </ul>
        )
      }

      <div className="odl-refund-divider" />

      <h3>
        Remaining order value
      </h3>

      <div className="odl-refund-rows">

        <div className="odl-refund-row">

          <span>
            Total paid
          </span>

          <span>
            ₹
            {formatMoney(
              originalPaidNum,
            )}
          </span>
        </div>

        <div className="odl-refund-row odl-refund-row--deduct">

          <span>
            Total refund
          </span>

          <span>
            −₹
            {formatMoney(
              refundedNum,
            )}
          </span>
        </div>

        <div className="odl-refund-row odl-refund-row--total">

          <span>
            Remaining value
          </span>

          <strong>
            ₹
            {formatMoney(
              remainingValueNum,
            )}
          </strong>
        </div>
      </div>

      <p className="odl-refund-note">
        Refunds are credited to your FurniCart wallet and can be used on future
        orders.
      </p>

      {
        showDeliveryChargeNonRefundableNote(
          order,
          {
            refundSummary: true,
          },
        ) && (

          <p className="odl-refund-note odl-refund-note--policy">
            {DELIVERY_CHARGE_NON_REFUNDABLE_NOTE}
          </p>
        )
      }
    </div>
  );
}
