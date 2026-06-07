import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useParams,
} from "react-router-dom";

import {
  cancelOrderApi,
  cancelOrderLineApi,
  downloadOrderInvoicePdf,
  fetchOrderApi,
  submitReturnRequest,
} from "../../features/orders/orderAPI";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

export default function useOrderDetail() {

  const { orderNumber } = useParams();

  const location = useLocation();

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    invoiceBusy,
    setInvoiceBusy,
  ] = useState(false);

  const [
    invoiceError,
    setInvoiceError,
  ] = useState(null);

  const [
    cancelTarget,
    setCancelTarget,
  ] = useState(null);

  const [
    cancelReason,
    setCancelReason,
  ] = useState("");

  const [
    cancelBusy,
    setCancelBusy,
  ] = useState(false);

  const [
    cancelModalError,
    setCancelModalError,
  ] = useState(null);

  const [
    returnTargetLineId,
    setReturnTargetLineId,
  ] = useState(null);

  const [
    returnReason,
    setReturnReason,
  ] = useState("");

  const [
    returnBusy,
    setReturnBusy,
  ] = useState(false);

  const [
    returnModalError,
    setReturnModalError,
  ] = useState(null);

  const [
    trackingLineId,
    setTrackingLineId,
  ] = useState(null);

  const lastOrderSigRef =
    useRef(
      null,
    );

  useEffect(() => {

    let cancelled = false;

    if (!orderNumber) {

      setLoading(false);

      setError("Missing order reference.");

      return;
    }

    lastOrderSigRef.current =
      null;

    (
      async () => {

        setLoading(true);

        setError(null);

        try {

          const data = await fetchOrderApi(
            decodeURIComponent(orderNumber),
          );

          if (cancelled)
            return;

          lastOrderSigRef.current =
            stableStringify(
              data,
            );

          setOrder(data);
        } catch (err) {

          if (cancelled)
            return;

          setError(

            formatProductApiError(
              err.response?.data,
            ) ||

              "Could not load this order.",
          );
        } finally {

          if (!cancelled) {

            setLoading(false);
          }
        }
      }
    )();

    return () => {

      cancelled = true;
    };
  }, [orderNumber, location.key]);

  const refetchOrder = useCallback(
    async (
      { silent = false } = {},
    ) => {

      if (
        !orderNumber
      ) {

        return;
      }

      try {

        const data = await fetchOrderApi(
          decodeURIComponent(orderNumber),
        );

        const snap =
          stableStringify(
            data,
          );

        if (
          silent &&
          lastOrderSigRef.current ===
            snap
        ) {

          return;
        }

        lastOrderSigRef.current =
          snap;

        setOrder(
          data,
        );
      } catch (err) {

        if (!silent) {

          setError(

            formatProductApiError(
              err.response?.data,
            ) ||

              "Could not refresh this order.",
          );
        }
      }
    },
    [orderNumber],
  );

  useBackgroundServerSync(
    {

      enabled: Boolean(
        orderNumber,
      ),

      pollIntervalMs: 90_000,

      onRefresh:
        () =>
          refetchOrder(
            {
              silent: true,
            },
          ),
    },
  );

  useEffect(
    () => {

      const onPageShow = (
        e,
      ) => {

        if (
          e.persisted &&
          orderNumber
        ) {

          refetchOrder();
        }
      };

      window.addEventListener(
        "pageshow",
        onPageShow,
      );

      return () => {

        window.removeEventListener(
          "pageshow",
          onPageShow,
        );
      };
    },
    [
      orderNumber,
      refetchOrder,
    ],
  );

  const canCancelLine = (line) =>
    line.status === "active" &&
    (line.fulfillment_status || "pending") === "pending";

  const canCancelEntireOrder =
    order &&
    (order.lines || []).some(
      (l) =>
        l.status === "active",
    ) &&
    (order.lines || []).every(
      (l) =>
        l.status !== "active" ||
        (l.fulfillment_status || "pending") === "pending",
    );

  const openReturnModal = (lineId) => {

    setReturnModalError(null);

    setReturnReason("");

    setReturnTargetLineId(lineId);
  };

  const closeReturnModal = () => {

    if (returnBusy) {

      return;
    }

    setReturnTargetLineId(null);

    setReturnReason("");

    setReturnModalError(null);
  };

  const submitReturn = async () => {

    if (!order?.order_number || !returnTargetLineId) {

      return;
    }

    const r = returnReason.trim();

    if (!r) {

      setReturnModalError("Please enter a return reason.");

      return;
    }

    setReturnBusy(true);

    setReturnModalError(null);

    try {

      const data = await submitReturnRequest(
        order.order_number,
        returnTargetLineId,
        { reason: r },
      );

      lastOrderSigRef.current =
        stableStringify(
          data,
        );

      setOrder(
        data,
      );

      setReturnTargetLineId(null);

      setReturnReason("");
    } catch (err) {

      setReturnModalError(

        formatProductApiError(
          err.response?.data,
        ) ||

          err.message ||

          "Could not submit return.",
      );
    } finally {

      setReturnBusy(false);
    }
  };

  const handleDownloadInvoice = async () => {

    if (
      !order?.order_number
    ) {

      return;
    }

    setInvoiceBusy(
      true,
    );

    setInvoiceError(
      null,
    );

    try {

      await downloadOrderInvoicePdf(
        order.order_number,
      );
    } catch (err) {

      setInvoiceError(

        err.message ||

          "Could not download invoice.",
      );
    } finally {

      setInvoiceBusy(
        false,
      );
    }
  };

  const openCancelOrderModal = () => {

    if (
      !canCancelEntireOrder
    ) {

      return;
    }

    setCancelModalError(
      null,
    );

    setCancelReason(
      "",
    );

    setCancelTarget(
      { type: "order" },
    );
  };

  const openCancelLineModal = (lineId) => {

    const line = order?.lines?.find(
      (l) =>
        l.id === lineId,
    );

    if (
      !line ||
      !canCancelLine(
        line,
      )
    ) {

      return;
    }

    setCancelModalError(
      null,
    );

    setCancelReason(
      "",
    );

    setCancelTarget(
      { type: "line", lineId },
    );
  };

  const closeCancelModal = () => {

    if (cancelBusy) {

      return;
    }

    setCancelTarget(
      null,
    );

    setCancelReason(
      "",
    );

    setCancelModalError(
      null,
    );
  };

  const submitCancel = async () => {

    if (!order?.order_number || !cancelTarget) {

      return;
    }

    setCancelBusy(
      true,
    );

    setCancelModalError(
      null,
    );

    try {

      const body = {};

      if (cancelReason.trim()) {

        body.reason = cancelReason.trim().slice(
          0,
          500,
        );
      }

      if (cancelTarget.type === "order") {

        await cancelOrderApi(
          order.order_number,
          body,
        );
      } else {

        await cancelOrderLineApi(
          order.order_number,
          cancelTarget.lineId,
          body,
        );
      }

      await refetchOrder();

      setCancelTarget(
        null,
      );

      setCancelReason(
        "",
      );
    } catch (err) {

      setCancelModalError(

        formatProductApiError(
          err.response?.data,
        ) ||

          err.message ||

          "Could not complete cancellation.",
      );
    } finally {

      setCancelBusy(
        false,
      );
    }
  };

  return {
    order,
    loading,
    error,
    invoiceBusy,
    invoiceError,
    cancelTarget,
    cancelReason,
    setCancelReason,
    cancelBusy,
    cancelModalError,
    returnTargetLineId,
    returnReason,
    setReturnReason,
    returnBusy,
    returnModalError,
    trackingLineId,
    setTrackingLineId,
    canCancelLine,
    canCancelEntireOrder,
    handleDownloadInvoice,
    openCancelOrderModal,
    openCancelLineModal,
    closeCancelModal,
    submitCancel,
    openReturnModal,
    closeReturnModal,
    submitReturn,
  };
}
