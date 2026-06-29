import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  getAddresses,
} from "../address/addressSlice";

import {
  fetchCart,
  fetchCheckoutPreview,
} from "../cart/cartAPI";

import {
  fetchAvailableCoupons,
} from "../promotions/couponAPI";

import {
  fetchWalletApi,
} from "../wallet/walletAPI";

import {
  createOrderApi,
} from "../orders/orderAPI";

import {
  initiateRazorpayCheckoutApi,
  verifyRazorpayPaymentApi,
} from "../payments/razorpayAPI";

import {
  loadRazorpayCheckoutScript,
  openRazorpayCheckout,
} from "../payments/razorpayCheckout";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  gstPercentLabel,
} from "./checkoutUtils.js";

import useCheckoutCoupon from "./useCheckoutCoupon.js";

export default function useCheckout() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const { addresses } = useSelector(
    (state) => state.address,
  );

  const [
    cartData,
    setCartData,
  ] = useState(null);

  const [
    cartLoading,
    setCartLoading,
  ] = useState(true);

  const [
    cartError,
    setCartError,
  ] = useState(null);

  const [
    selectedAddressId,
    setSelectedAddressId,
  ] = useState(null);

  const [
    pricingPreview,
    setPricingPreview,
  ] = useState(null);

  const [
    pricingError,
    setPricingError,
  ] = useState(null);

  const [
    availableCoupons,
    setAvailableCoupons,
  ] = useState(
    [],
  );

  const [
    selectedPaymentMethod,
    setSelectedPaymentMethod,
  ] = useState(
    "cod",
  );

  const [
    placeError,
    setPlaceError,
  ] = useState(null);

  const [
    placeBusy,
    setPlaceBusy,
  ] = useState(false);

  const [
    confirmPlaceOpen,
    setConfirmPlaceOpen,
  ] = useState(false);

  const [
    walletBalance,
    setWalletBalance,
  ] = useState(
    null,
  );

  const lastCartSigRef =
    useRef(
      null,
    );

  const lastPreviewSigRef =
    useRef(
      null,
    );

  const paymentCompletedRef =
    useRef(
      false,
    );

  const razorpayAttemptRef =
    useRef(
      0,
    );

  const reloadCheckoutData =
    useCallback(
      async (
        {
          silent = false,

          isCancelled = () =>
            false,
        } = {},
      ) => {

        if (!silent) {

          setCartLoading(
            true,
          );

          setCartError(
            null,
          );
        }

        try {

          const cartRes =
            await fetchCart();

          if (
            isCancelled()
          ) {

            return;
          }

          const cartSnap =
            stableStringify(
              cartRes,
            );

          if (
            !(
              silent &&
              lastCartSigRef.current ===
              cartSnap
            )
          ) {

            lastCartSigRef.current =
              cartSnap;

            setCartData(
              cartRes,
            );
          }

          try {

            const couponsRes =
              await fetchAvailableCoupons();

            if (
              !isCancelled()
            ) {

              setAvailableCoupons(
                couponsRes.coupons ||
                [],
              );
            }
          } catch {

            if (
              !isCancelled() &&
              !silent
            ) {

              setAvailableCoupons(
                [],
              );
            }
          }

          try {

            const preview =
              await fetchCheckoutPreview();

            if (
              isCancelled()
            ) {

              return;
            }

            const previewSnap =
              stableStringify(
                preview,
              );

            if (
              !(
                silent &&
                lastPreviewSigRef.current ===
                previewSnap
              )
            ) {

              lastPreviewSigRef.current =
                previewSnap;

              setPricingPreview(
                preview,
              );

              if (
                Array.isArray(
                  preview.active_coupons,
                )
              ) {

                setAvailableCoupons(
                  preview.active_coupons,
                );
              }

              setPricingError(
                null,
              );
            }
          } catch (prevErr) {

            if (
              isCancelled()
            ) {

              return;
            }

            if (!silent) {

              lastPreviewSigRef.current =
                null;

              setPricingPreview(
                null,
              );

              setPricingError(

                formatProductApiError(
                  prevErr.response?.data,
                ) ||

                "Could not load checkout totals.",
              );
            }
          }

          try {

            const walletRes =
              await fetchWalletApi();

            if (
              !isCancelled()
            ) {

              setWalletBalance(
                Number(
                  walletRes.balance ?? 0,
                ),
              );
            }
          } catch {

            if (
              !isCancelled()
            ) {

              setWalletBalance(
                0,
              );
            }
          }
        } catch (err) {

          if (
            isCancelled()
          ) {

            return;
          }

          if (!silent) {

            lastCartSigRef.current =
              null;

            setCartError(

              formatProductApiError(
                err.response?.data,
              ) ||

              "Could not load cart.",
            );
          }
        } finally {

          if (
            !silent &&
            !isCancelled()
          ) {

            setCartLoading(
              false,
            );
          }
        }
      },

      [],
    );

  const {
    couponInput,
    setCouponInput,
    couponBusy,
    applyCoupon,
    removeCoupon,
  } = useCheckoutCoupon(
    {
      setPricingPreview,
      setAvailableCoupons,
      lastPreviewSigRef,
      reloadCheckoutData,
    },
  );

  useEffect(() => {

    dispatch(
      getAddresses(),
    );
  }, [dispatch]);

  useEffect(() => {

    setPlaceError(
      null,
    );

    paymentCompletedRef.current =
      false;
  }, []);

  useEffect(() => {

    let cancelled = false;

    reloadCheckoutData(
      {

        silent: false,

        isCancelled:
          () =>
            cancelled,
      },
    );

    return () => {

      cancelled = true;
    };
  }, [reloadCheckoutData]);

  useBackgroundServerSync(
    {

      enabled: true,

      pollIntervalMs: 90_000,

      onRefresh:
        () =>
          reloadCheckoutData(
            {
              silent: true,
            },
          ),
    },
  );

  useEffect(() => {

    const preferredId =
      location.state?.selectAddressId;

    if (preferredId != null) {

      if (
        addresses.some(
          (a) => a.id === preferredId,
        )
      ) {

        setSelectedAddressId(preferredId);
      }

      return;
    }

    if (!addresses.length) {

      return;
    }

    const validSelected =
      selectedAddressId != null &&
      addresses.some(
        (a) => a.id === selectedAddressId,
      );

    if (validSelected) {

      return;
    }

    const def = addresses.find(
      (a) => a.is_default,
    );

    setSelectedAddressId(
      def?.id ?? addresses[0].id,
    );
  }, [
    addresses,
    selectedAddressId,
    location.state?.selectAddressId,
  ]);

  const subtotalNum = Number(
    pricingPreview?.subtotal ??
    cartData?.subtotal ??
    0,
  );

  const taxNum = Number(
    pricingPreview?.tax_total ?? 0,
  );

  const shipNum = Number(
    pricingPreview?.shipping_total ?? 0,
  );

  const discountNum = Number(
    pricingPreview?.discount_total ?? 0,
  );

  const offerDiscountNum = Number(
    pricingPreview?.offer_discount_total ?? 0,
  );

  const grandNum = Number(
    pricingPreview?.grand_total ??
    (
      subtotalNum + taxNum + shipNum - discountNum
    ),
  );

  const gstPct = gstPercentLabel(
    pricingPreview?.gst_rate,
  );

  const freeShipMin = pricingPreview?.free_shipping_min_subtotal;

  const walletCanPay =
    walletBalance != null &&
    walletBalance >= grandNum &&
    grandNum > 0;

  const orderReady =
    Boolean(
      cartData?.items?.length &&
      cartData?.can_checkout &&
      pricingPreview &&
      !pricingError &&
      selectedAddressId &&
      (
        selectedPaymentMethod === "cod" ||
        selectedPaymentMethod === "razorpay" ||
        (
          selectedPaymentMethod === "wallet" &&
          walletCanPay
        )
      ),
    );

  const canPlace =
    Boolean(
      orderReady &&
      !placeBusy,
    );

  useEffect(() => {

    if (
      selectedPaymentMethod === "wallet" &&
      walletBalance != null &&
      !walletCanPay
    ) {

      setSelectedPaymentMethod(
        "cod",
      );
    }
  }, [
    selectedPaymentMethod,
    walletBalance,
    walletCanPay,
  ]);

  const openPlaceConfirm = () => {

    if (
      !orderReady ||
      placeBusy
    ) {

      return;
    }

    setPlaceError(
      null,
    );

    setConfirmPlaceOpen(
      true,
    );
  };

  const goToPaymentFailed = (
    reason,
    message,
  ) => {

    if (
      paymentCompletedRef.current
    ) {

      return;
    }

    setConfirmPlaceOpen(
      false,
    );

    navigate(
      "/checkout/payment-failed",
      {
        replace: true,
        state: {
          reason,
          message,
        },
      },
    );
  };

  const runPlaceOrder = async () => {

    setPlaceError(
      null,
    );

    setPlaceBusy(
      true,
    );

    try {

      if (
        selectedPaymentMethod === "cod" ||
        selectedPaymentMethod === "wallet"
      ) {

        const order = await createOrderApi(
          {
            address_id: selectedAddressId,

            payment_method: selectedPaymentMethod,
          },
        );

        setConfirmPlaceOpen(
          false,
        );

        navigate(
          `/checkout/success/${encodeURIComponent(order.order_number)}`,
          {
            replace: true,
          },
        );

        return;
      }

      if (
        selectedPaymentMethod === "razorpay"
      ) {

        paymentCompletedRef.current =
          false;

        const attemptId =
          razorpayAttemptRef.current
          + 1;

        razorpayAttemptRef.current =
          attemptId;

        await loadRazorpayCheckoutScript();

        const checkout =
          await initiateRazorpayCheckoutApi(
            {
              address_id: selectedAddressId,
            },
          );

        await new Promise(
          (
            resolve,
            reject,
          ) => {

            let hadPaymentFailure =
              false;

            let lastFailureMessage =
              null;

            openRazorpayCheckout(
              {
                checkout,

                onSuccess:
                  async (
                    response,
                  ) => {

                    if (
                      attemptId
                      !== razorpayAttemptRef.current
                    ) {

                      return;
                    }

                    try {

                      const order =
                        await verifyRazorpayPaymentApi(
                          {
                            razorpay_order_id:
                              response.razorpay_order_id,

                            razorpay_payment_id:
                              response.razorpay_payment_id,

                            razorpay_signature:
                              response.razorpay_signature,
                          },
                        );

                      if (
                        attemptId
                        !== razorpayAttemptRef.current
                      ) {

                        return;
                      }

                      resolve(
                        order,
                      );
                    } catch (
                    verifyErr
                    ) {

                      if (
                        attemptId
                        !== razorpayAttemptRef.current
                      ) {

                        return;
                      }

                      reject(
                        verifyErr,
                      );
                    }
                  },

                onDismiss:
                  () => {

                    if (
                      attemptId
                      !== razorpayAttemptRef.current
                    ) {

                      return;
                    }

                    if (
                      hadPaymentFailure
                    ) {

                      goToPaymentFailed(
                        "failed",
                        lastFailureMessage ||

                        "Payment failed. No order was placed.",
                      );

                      reject(
                        new Error(
                          "payment_failed",
                        ),
                      );

                      return;
                    }

                    goToPaymentFailed(
                      "cancelled",
                      "Payment was cancelled. No order was placed.",
                    );

                    reject(
                      new Error(
                        "payment_cancelled",
                      ),
                    );
                  },

                onFailure:
                  (
                    response,
                  ) => {

                    if (
                      attemptId
                      !== razorpayAttemptRef.current
                    ) {

                      return;
                    }

                    hadPaymentFailure =
                      true;

                    lastFailureMessage =
                      response?.error?.description ||

                      "Payment failed. Please try again in the payment window.";

                    setPlaceError(
                      lastFailureMessage,
                    );
                  },
              },
            );
          },
        ).then(
          (
            order,
          ) => {

            paymentCompletedRef.current =
              true;

            setConfirmPlaceOpen(
              false,
            );

            setPlaceError(
              null,
            );

            navigate(
              `/checkout/success/${encodeURIComponent(order.order_number)}`,
              {
                replace: true,
              },
            );
          },
        ).catch(
          (
            razorpayErr,
          ) => {

            if (
              paymentCompletedRef.current
            ) {

              return;
            }

            if (
              razorpayErr?.message ===
              "payment_cancelled" ||

              razorpayErr?.message ===
              "payment_failed"
            ) {

              return;
            }

            goToPaymentFailed(
              "verify_failed",

              formatProductApiError(
                razorpayErr.response?.data,
              ) ||

              razorpayErr.message ||

              "Payment could not be confirmed.",
            );
          },
        );

        return;
      }

      throw new Error(
        "Unsupported payment method.",
      );
    } catch (err) {

      if (
        paymentCompletedRef.current ||

        err?.message ===
        "payment_cancelled" ||

        err?.message ===
        "payment_failed"
      ) {

        return;
      }

      setPlaceError(

        err.message ||

        formatProductApiError(
          err.response?.data,
        ) ||

        "Could not place order. Please try again.",
      );
    } finally {

      setPlaceBusy(
        false,
      );
    }
  };

  return {
    addresses,
    cartData,
    cartLoading,
    cartError,
    selectedAddressId,
    setSelectedAddressId,
    pricingPreview,
    pricingError,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    placeError,
    placeBusy,
    confirmPlaceOpen,
    setConfirmPlaceOpen,
    subtotalNum,
    taxNum,
    shipNum,
    discountNum,
    offerDiscountNum,
    grandNum,
    gstPct,
    freeShipMin,
    orderReady,
    canPlace,
    openPlaceConfirm,
    runPlaceOrder,
    couponInput,
    setCouponInput,
    couponBusy,
    applyCoupon,
    removeCoupon,
    availableCoupons,
    walletBalance,
    walletCanPay,
  };
}
