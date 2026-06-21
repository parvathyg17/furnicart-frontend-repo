import {
  useCallback,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  applyCartCoupon,
  removeCartCoupon,
} from "../promotions/couponAPI";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

/**
 * Coupon apply/remove for checkout.
 * Updates pricing preview via API `preview` payload.
 */
export default function useCheckoutCoupon(
  {
    setPricingPreview,
    lastPreviewSigRef,
    reloadCheckoutData,
  },
) {

  const [
    couponInput,
    setCouponInput,
  ] = useState(
    "",
  );

  const [
    couponBusy,
    setCouponBusy,
  ] = useState(
    false,
  );

  const applyCoupon = useCallback(
    async (
      codeOverride,
    ) => {

      const code = (
        typeof codeOverride === "string"
          ? codeOverride
          : couponInput
      ).trim();

      if (
        !code
      ) {

        toast.error(
          "Enter a coupon code.",
        );

        return;
      }

      setCouponBusy(
        true,
      );

      try {

        const data = await applyCartCoupon(
          code,
        );

        const preview =
          data.preview;

        if (
          preview
        ) {

          lastPreviewSigRef.current =
            stableStringify(
              preview,
            );

          setPricingPreview(
            preview,
          );
        } else {

          await reloadCheckoutData(
            {
              silent: true,
            },
          );
        }

        setCouponInput(
          "",
        );

        toast.success(
          data.message ||
            "Coupon applied.",
        );
      } catch (err) {

        toast.error(

          formatProductApiError(
            err.response?.data,
          ) ||

            "Could not apply coupon.",
        );
      } finally {

        setCouponBusy(
          false,
        );
      }
    },

    [
      couponInput,
      lastPreviewSigRef,
      reloadCheckoutData,
      setPricingPreview,
    ],
  );

  const removeCoupon = useCallback(
    async () => {

      setCouponBusy(
        true,
      );

      try {

        const data = await removeCartCoupon();

        const preview =
          data.preview;

        if (
          preview
        ) {

          lastPreviewSigRef.current =
            stableStringify(
              preview,
            );

          setPricingPreview(
            preview,
          );
        } else {

          await reloadCheckoutData(
            {
              silent: true,
            },
          );
        }

        setCouponInput(
          "",
        );

        toast.success(
          data.message ||
            "Coupon removed.",
        );
      } catch (err) {

        toast.error(

          formatProductApiError(
            err.response?.data,
          ) ||

            "Could not remove coupon.",
        );
      } finally {

        setCouponBusy(
          false,
        );
      }
    },

    [
      lastPreviewSigRef,
      reloadCheckoutData,
      setPricingPreview,
    ],
  );

  return {
    couponInput,
    setCouponInput,
    couponBusy,
    applyCoupon,
    removeCoupon,
  };
}
