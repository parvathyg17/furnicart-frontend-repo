import "../../styles/shop.css";
import "../../styles/checkout.css";
import "../../styles/orderdetail.css";

import useOrderDetail from "../../features/orders/useOrderDetail.js";

import OrderHeader from "../../features/orders/components/OrderHeader.jsx";
import OrderProgressStepper from "../../features/orders/components/OrderProgressStepper.jsx";
import OrderShippingAddress from "../../features/orders/components/OrderShippingAddress.jsx";
import OrderPaymentMethodCard from "../../features/orders/components/OrderPaymentMethodCard.jsx";
import OrderItemsList from "../../features/orders/components/OrderItemsList.jsx";
import OrderPricing from "../../features/orders/components/OrderPricing.jsx";
import OrderDetailToolbar from "../../features/orders/components/OrderDetailToolbar.jsx";
import CancelOrderModal from "../../features/orders/components/CancelOrderModal.jsx";
import ReturnRequestModal from "../../features/orders/components/ReturnRequestModal.jsx";

export default function OrderDetail() {

  const {
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
  } = useOrderDetail();

  return (

    <div className="artisan-shop order-detail-shell">

      <main className="order-detail-main">

        {
          loading ? (

            <p className="cart-bag-muted">
              Loading…
            </p>
          ) : error ? (

            <div
              className="shop-banner error cart-bag-banner"
              role="alert"
            >
              {error}
            </div>
          ) : order ? (

            <>

              <div className="odl-page">

                <OrderHeader
                  order={order}
                  invoiceBusy={invoiceBusy}
                  onDownloadInvoice={handleDownloadInvoice}
                  canCancelEntireOrder={canCancelEntireOrder}
                  onCancelEntireOrder={openCancelOrderModal}
                />

                {
                  invoiceError && (

                    <div
                      className="shop-banner error cart-bag-banner"
                      role="alert"
                      style={{ marginBottom: "0.75rem" }}
                    >
                      {invoiceError}
                    </div>
                  )
                }

                <OrderProgressStepper order={order} />

                <div className="odl-cards-row">

                  <OrderShippingAddress order={order} />

                  <OrderPaymentMethodCard order={order} />
                </div>

                <div className="odl-summary-card">

                  <div className="odl-summary-head">

                    <h2>
                      Order summary
                    </h2>
                  </div>

                  <OrderItemsList
                    order={order}
                    trackingLineId={trackingLineId}
                    onToggleTracking={(lineId) => {

                      setTrackingLineId(
                        (prev) =>
                          prev === lineId
                            ? null
                            : lineId,
                      );
                    }}
                    canCancelLine={canCancelLine}
                    onOpenCancelLine={openCancelLineModal}
                    onOpenReturn={openReturnModal}
                  />

                  <OrderPricing order={order} />
                </div>

                <OrderDetailToolbar />
              </div>

              <CancelOrderModal
                open={Boolean(cancelTarget)}
                cancelTarget={cancelTarget}
                cancelReason={cancelReason}
                onCancelReasonChange={setCancelReason}
                cancelBusy={cancelBusy}
                cancelModalError={cancelModalError}
                onClose={closeCancelModal}
                onConfirm={submitCancel}
              />

              <ReturnRequestModal
                open={returnTargetLineId !== null}
                returnReason={returnReason}
                onReturnReasonChange={setReturnReason}
                returnBusy={returnBusy}
                returnModalError={returnModalError}
                onClose={closeReturnModal}
                onSubmit={submitReturn}
              />
            </>
          ) : null
        }
      </main>
    </div>
  );
}
