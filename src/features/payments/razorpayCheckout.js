export function loadRazorpayCheckoutScript() {

  if (
    typeof window === "undefined"
  ) {

    return Promise.reject(
      new Error(
        "Razorpay is only available in the browser.",
      ),
    );
  }

  if (
    window.Razorpay
  ) {

    return Promise.resolve();
  }

  return new Promise(
    (
      resolve,
      reject,
    ) => {

      const existing = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (
        existing
      ) {

        existing.addEventListener(
          "load",
          () => resolve(),
        );

        existing.addEventListener(
          "error",
          () => reject(
            new Error(
              "Could not load Razorpay checkout.",
            ),
          ),
        );

        return;
      }

      const script = document.createElement(
        "script",
      );

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => resolve();

      script.onerror = () => reject(
        new Error(
          "Could not load Razorpay checkout.",
        ),
      );

      document.body.appendChild(
        script,
      );
    },
  );
}

export function openRazorpayCheckout(
  {
    checkout,
    onSuccess,
    onDismiss,
    onFailure,
  },
) {

  if (
    !window.Razorpay
  ) {

    throw new Error(
      "Razorpay checkout is not loaded.",
    );
  }

  let settled = false;

  const rzp = new window.Razorpay(
    {
      key: checkout.key_id,
      amount: checkout.amount_paise,
      currency: checkout.currency,
      order_id: checkout.razorpay_order_id,
      name: "FurniCart",
      description: "FurniCart order payment",
      prefill: checkout.prefill || {},
      handler: (
        response,
      ) => {

        settled = true;

        onSuccess(
          response,
        );
      },
      modal: {
        ondismiss: () => {

          if (
            settled
          ) {

            return;
          }

          settled = true;

          onDismiss();
        },
      },
    },
  );

  rzp.on(
    "payment.failed",
    (
      response,
    ) => {

      if (
        settled
      ) {

        return;
      }

      // Do not mark settled — Razorpay keeps the modal open for retry.
      onFailure(
        response,
      );
    },
  );

  rzp.open();

  return rzp;
}
