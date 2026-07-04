import {
  Check,
} from "lucide-react";

import {
  formatDateShort,
} from "../../../utils/date.js";

import {
  ORDER_TRACK_STEPS,
  orderBarFilled,
  orderStepDotKind,
  resolveOrderTracker,
} from "../orderUi.js";

export default function OrderProgressStepper(
  {
    order,
  },
) {

  const tracker = resolveOrderTracker(
    order.status,
  );

  const placed = formatDateShort(
    order.placed_at,
  );

  return (

    <div className="odl-order-track">

      {
        tracker.cancelled && (

          <p className="odl-order-track-cancelled">
            This order was cancelled.
          </p>
        )
      }

      <div
        className="odl-track-flex"
        role="list"
        aria-label="Order shipping progress"
      >

        {
          ORDER_TRACK_STEPS.map(
            (
              step,
              i,
            ) => {

              const kind = orderStepDotKind(
                i,
                tracker,
              );

              const labelClass = [
                "odl-track-label",
                kind === "current"
                  ? "odl-track-label--current"
                  : "",
                kind === "done"
                  ? "odl-track-label--done"
                  : "",
              ].filter(
                Boolean,
              ).join(
                " ",
              );

              const dotClass = [
                "odl-track-dot",
                kind === "done"
                  ? "odl-track-dot--done"
                  : "",
                kind === "current"
                  ? "odl-track-dot--current"
                  : "",
                kind === "upcoming"
                  ? "odl-track-dot--upcoming"
                  : "",
              ].filter(
                Boolean,
              ).join(
                " ",
              );

              const meta = (

                kind === "done" &&
                i === 0 &&
                order.placed_at
              )
                ? placed
                : "";

              return (

                <div key={step.key} style={{ display: "contents" }}>

                  {
                    i > 0 && (

                      <div
                        className={
                          `odl-track-bar${
                            orderBarFilled(
                              i - 1,
                              tracker.phase,
                              tracker.allDelivered,
                            )
                              ? " odl-track-bar--on"
                              : ""
                          }`
                        }
                        aria-hidden
                      />
                    )
                  }

                  <div
                    className="odl-track-col"
                    role="listitem"
                  >

                    <div className={dotClass}>

                      {
                        kind === "done"
                          ? (
                            <Check size={16} strokeWidth={2.5} aria-hidden />
                          )
                          : null
                      }
                    </div>

                    <div className={labelClass}>
                      {step.label}
                    </div>

                    <div className="odl-track-meta">
                      {meta}
                    </div>
                  </div>
                </div>
              );
            },
          )
        }
      </div>
    </div>
  );
}
