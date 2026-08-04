import "../../styles/shop.css";
import "../../styles/checkout.css";

import { Link } from "react-router-dom";

import useCheckout from "../../features/checkout/useCheckout.js";

import CheckoutPageHeader from "../../features/checkout/components/CheckoutPageHeader.jsx";
import CheckoutDeliverySection from "../../features/checkout/components/CheckoutDeliverySection.jsx";
import CheckoutLineItems from "../../features/checkout/components/CheckoutLineItems.jsx";
import CheckoutSummaryAside from "../../features/checkout/components/CheckoutSummaryAside.jsx";
import CheckoutActiveCoupons from "../../features/checkout/components/CheckoutActiveCoupons.jsx";
import PlaceOrderConfirmModal from "../../features/checkout/components/PlaceOrderConfirmModal.jsx";

export default function Checkout() {
  const {
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
    taxNum,
    shipNum,
    discountNum,
    offerDiscountNum,
    grandNum,
    gstPct,
    freeShipMin,
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
  } = useCheckout();

  return (
    <div className="artisan-shop checkout-shell">
      <main className="checkout-main">
        <CheckoutPageHeader />

        {pricingError && (
          <div className="shop-banner error cart-bag-banner" role="alert">
            {pricingError}
          </div>
        )}

        {cartError && (
          <div className="shop-banner error cart-bag-banner" role="alert">
            {cartError}
          </div>
        )}

        {placeError && (
          <div className="shop-banner error cart-bag-banner" role="alert">
            {placeError}
          </div>
        )}

        {cartLoading ? (
          <p className="cart-bag-muted">Loading…</p>
        ) : !cartData?.items?.length ? (
          <div className="checkout-panel">
            <p className="cart-bag-muted">
              Your bag is empty. Add something from the shop before checkout.
            </p>

            <Link
              className="cart-bag-empty-cta"
              style={{ marginTop: "1rem", display: "inline-block" }}
              to="/shop"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <div>
              <CheckoutDeliverySection
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onSelectAddress={setSelectedAddressId}
              />

              <CheckoutActiveCoupons
                activeCoupons={availableCoupons}
                loaded={!cartLoading && Boolean(cartData?.items?.length)}
                appliedCode={pricingPreview?.coupon?.code}
                couponBusy={couponBusy}
                onApplyCode={(code) => {
                  applyCoupon(code);
                }}
              />

              <CheckoutLineItems items={cartData.items} />
            </div>

            <CheckoutSummaryAside
              cartData={cartData}
              pricingPreview={pricingPreview}
              taxNum={taxNum}
              shipNum={shipNum}
              discountNum={discountNum}
              offerDiscountNum={offerDiscountNum}
              grandNum={grandNum}
              gstPct={gstPct}
              freeShipMin={freeShipMin}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodChange={setSelectedPaymentMethod}
              canPlace={canPlace}
              placeBusy={placeBusy}
              onPlaceClick={openPlaceConfirm}
              couponInput={couponInput}
              onCouponInputChange={setCouponInput}
              couponBusy={couponBusy}
              onApplyCoupon={() => {
                applyCoupon();
              }}
              onRemoveCoupon={removeCoupon}
              walletBalance={walletBalance}
              walletCanPay={walletCanPay}
            />
          </div>
        )}
      </main>

      <PlaceOrderConfirmModal
        open={confirmPlaceOpen}
        cartData={cartData}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        pricingPreview={pricingPreview}
        taxNum={taxNum}
        shipNum={shipNum}
        discountNum={discountNum}
        grandNum={grandNum}
        gstPct={gstPct}
        placeBusy={placeBusy}
        placeError={placeError}
        selectedPaymentMethod={selectedPaymentMethod}
        onClose={() => {
          setConfirmPlaceOpen(false);
        }}
        onConfirm={runPlaceOrder}
      />
    </div>
  );
}
