import "../../styles/shop.css";
import "../../styles/checkout.css";
import "../../styles/orderdetail.css";

import useOrderDetail from "../../features/orders/useOrderDetail.js";

import OrderHeader from "../../features/orders/components/OrderHeader.jsx";
import OrderHeroCard from "../../features/orders/components/OrderHeroCard.jsx";
import OrderSideInfo from "../../features/orders/components/OrderSideInfo.jsx";
import OrderItemsList from "../../features/orders/components/OrderItemsList.jsx";
import OrderSummaryCard from "../../features/orders/components/OrderSummaryCard.jsx";
import OrderRefundSummary from "../../features/orders/components/OrderRefundSummary.jsx";
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
    cancelQuantity,
    setCancelQuantity,
    returnTargetLineId,
    returnReason,
    setReturnReason,
    returnQuantity,
    setReturnQuantity,
    returnBusy,
    returnModalError,
    canCancelLine,
    canCancelEntireOrder,
    canDownloadInvoice,
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

                <OrderHeader />

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

                <div className="odl-layout">

                  <div className="odl-col-main">

                    <OrderHeroCard
                      order={order}
                      invoiceBusy={invoiceBusy}
                      canDownloadInvoice={canDownloadInvoice}
                      onDownloadInvoice={handleDownloadInvoice}
                      canCancelEntireOrder={canCancelEntireOrder}
                      onCancelEntireOrder={openCancelOrderModal}
                    />

                    <section className="odl-main">

                      <h2 className="odl-section-title">
                        Shipment details
                      </h2>

                      <OrderItemsList
                        order={order}
                        canCancelLine={canCancelLine}
                        onOpenCancelLine={openCancelLineModal}
                        onOpenReturn={openReturnModal}
                      />
                    </section>

                    <OrderRefundSummary order={order} />
                  </div>

                  <aside className="odl-col-side">

                    <OrderSideInfo order={order} />

                    <OrderSummaryCard order={order} />
                  </aside>
                </div>

                <OrderDetailToolbar />
              </div>

              <CancelOrderModal
                open={Boolean(cancelTarget)}
                cancelTarget={cancelTarget}
                cancelReason={cancelReason}
                onCancelReasonChange={setCancelReason}
                cancelQuantity={cancelQuantity}
                onCancelQuantityChange={setCancelQuantity}
                cancelBusy={cancelBusy}
                cancelModalError={cancelModalError}
                onClose={closeCancelModal}
                onConfirm={submitCancel}
                order={order}
              />

              <ReturnRequestModal
                open={returnTargetLineId !== null}
                returnReason={returnReason}
                onReturnReasonChange={setReturnReason}
                returnQuantity={returnQuantity}
                onReturnQuantityChange={setReturnQuantity}
                returnBusy={returnBusy}
                returnModalError={returnModalError}
                onClose={closeReturnModal}
                onSubmit={submitReturn}
                order={order}
                returnTargetLineId={returnTargetLineId}
              />
            </>
          ) : null
        }
      </main>
    </div>
  );
}
