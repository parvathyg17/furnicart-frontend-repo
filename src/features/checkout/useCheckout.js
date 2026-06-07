import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
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
  createOrderApi,
} from "../orders/orderAPI";

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

export default function useCheckout() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

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

  const lastCartSigRef =
    useRef(
      null,
    );

  const lastPreviewSigRef =
    useRef(
      null,
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

  useEffect(() => {

    dispatch(
      getAddresses(),
    );
  }, [dispatch]);

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

    if (!addresses.length || selectedAddressId != null) {

      return;
    }

    const def = addresses.find(
      (a) => a.is_default,
    );

    setSelectedAddressId(
      def?.id ?? addresses[0].id,
    );
  }, [addresses, selectedAddressId]);

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

  const orderReady =
    Boolean(
      cartData?.items?.length &&
      cartData?.can_checkout &&
      pricingPreview &&
      !pricingError &&
      selectedAddressId &&
      selectedPaymentMethod === "cod",
    );

  const canPlace =
    Boolean(
      orderReady &&
      !placeBusy,
    );

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

  const runPlaceOrder = async () => {

    setPlaceError(
      null,
    );

    setPlaceBusy(
      true,
    );

    try {

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
    } catch (err) {

      setPlaceError(

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
    grandNum,
    gstPct,
    freeShipMin,
    orderReady,
    canPlace,
    openPlaceConfirm,
    runPlaceOrder,
  };
}
