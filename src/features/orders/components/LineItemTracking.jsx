import { Check } from "lucide-react";

import { formatDateShort } from "../../../utils/date.js";

import { LINE_TRACK_STEPS, lineFulfillmentPhase } from "../orderUi.js";

import RejectedReturnNotice from "./RejectedReturnNotice.jsx";

export default function LineItemTracking({ line, orderPlacedAt }) {
  const fs = line.fulfillment_status || "pending";

  if (fs === "returned") {
    return (
      <div className="odl-mini-track odl-mini-track--returned">
        <p>
          This item was marked <strong>returned</strong> after delivery.
        </p>
      </div>
    );
  }

  const phase = lineFulfillmentPhase(fs);

  const allDelivered = fs === "delivered";

  const placed = formatDateShort(orderPlacedAt);

  return (
    <div className="odl-mini-track">
      <div className="odl-track-flex" role="list" aria-label="Item fulfillment">
        {LINE_TRACK_STEPS.map((step, i) => {
          const kind = (() => {
            if (allDelivered) {
              return "done";
            }

            if (i < phase) {
              return "done";
            }

            if (i === phase) {
              return "current";
            }

            return "upcoming";
          })();

          const labelClass = [
            "odl-track-label",
            kind === "current" ? "odl-track-label--current" : "",
            kind === "done" ? "odl-track-label--done" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const dotClass = [
            "odl-track-dot",
            kind === "done" ? "odl-track-dot--done" : "",
            kind === "current" ? "odl-track-dot--current" : "",
            kind === "upcoming" ? "odl-track-dot--upcoming" : "",
          ]
            .filter(Boolean)
            .join(" ");

          const barIdx = i - 1;

          const barOn = allDelivered ? barIdx < 3 : barIdx < phase;

          const meta =
            kind === "done" && i === 0 && orderPlacedAt ? placed : "";

          return (
            <div key={step.key} style={{ display: "contents" }}>
              {i > 0 && (
                <div
                  className={`odl-track-bar${
                    barOn ? " odl-track-bar--on" : ""
                  }`}
                  aria-hidden
                />
              )}

              <div className="odl-track-col" role="listitem">
                <div className={dotClass}>
                  {kind === "done" ? (
                    <Check size={14} strokeWidth={2.5} aria-hidden />
                  ) : null}
                </div>

                <div className={labelClass}>{step.label}</div>

                <div className="odl-track-meta">{meta}</div>
              </div>
            </div>
          );
        })}
      </div>

      {line.open_return && (
        <p className="odl-mini-track-note">
          {line.open_return.status === "approved"
            ? "Return approved — follow any instructions we sent by email."
            : "Return request submitted — we will notify you when it is reviewed."}
        </p>
      )}

      <RejectedReturnNotice lastReturn={line.last_return} />
    </div>
  );
}
