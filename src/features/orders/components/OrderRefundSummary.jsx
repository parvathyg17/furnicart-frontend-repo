import {
  Wallet,
} from "lucide-react";

import {
  codReturnRefundNote,
  codReturnRefundStatusLabel,
  isCodOrder,
} from "../orderUi.js";

import {
  formatMoney,
} from "../../../utils/currency.js";

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

  const refundTxns = order.refund_transactions || [];

  const codRefundStatus = codReturnRefundStatusLabel(
    order,
  );

  const codRefundNote = codReturnRefundNote(
    order,
    refundedNum,
  );

  const latestTxn = refundTxns.length > 0
    ? refundTxns[refundTxns.length - 1]
    : null;

  const refundDate = latestTxn
    ? formatRefundDate(
        latestTxn.created_at,
      )
    : order.cancelled_at
      ? formatRefundDate(
          order.cancelled_at,
        )
      : "—";

  return (

    <div className="odl-refund-banner">

      <h3 className="odl-refund-banner-title">
        Refund summary
      </h3>

      <div className="odl-refund-banner-grid">

        <div className="odl-refund-banner-col">

          <span className="odl-refund-banner-label">
            Refund amount
          </span>

          <span className="odl-refund-banner-amount">
            ₹
            {formatMoney(
              refundedNum,
            )}
          </span>
        </div>

        <div className="odl-refund-banner-col">

          <span className="odl-refund-banner-label">
            Refund method
          </span>

          <span className="odl-refund-banner-method">

            {
              isCodOrder(
                order,
              )
                ? codRefundStatus || "Refunded"
                : (
                  <>
                    <Wallet size={16} aria-hidden />
                    Refunded to wallet
                  </>
                )
            }
          </span>
        </div>

        <div className="odl-refund-banner-col">

          <span className="odl-refund-banner-label">
            Refund date
          </span>

          <span className="odl-refund-banner-date">
            {refundDate}
          </span>
        </div>
      </div>

      {
        codRefundNote && (

          <p className="odl-refund-banner-cod-note">
            {codRefundNote}
          </p>
        )
      }
    </div>
  );
}
