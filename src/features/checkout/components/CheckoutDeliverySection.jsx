import {
  Link,
} from "react-router-dom";

export default function CheckoutDeliverySection(
  {
    addresses,
    selectedAddressId,
    onSelectAddress,
  },
) {

  return (

    <section className="checkout-panel">

      <h2 className="checkout-panel-title artisan-font-serif">
        Delivery address
      </h2>

      {
        !addresses.length ? (

          <div>

            <p className="cart-bag-muted">
              You need a saved address to place an order.
            </p>

            <div className="checkout-address-actions">

              <Link
                to="/profile/addresses"
                className="cart-bag-empty-cta"
                style={{ display: "inline-block" }}
              >
                Add or manage addresses
              </Link>
            </div>
          </div>
        ) : (

          <div className="checkout-address-list">

            {
              addresses.map(
                (addr) => {

                  const selected =
                    selectedAddressId === addr.id;

                  return (

                    <label
                      key={addr.id}
                      className={
                        `checkout-address-row${
                          selected
                            ? " selected"
                            : ""
                        }`
                      }
                    >

                      <input
                        type="radio"
                        name="ship-addr"
                        checked={selected}
                        onChange={() => {

                          onSelectAddress(
                            addr.id,
                          );
                        }}
                      />

                      <div className="checkout-address-body">

                        <div className="checkout-address-name">
                          {addr.name}
                        </div>

                        <div className="checkout-address-meta">

                          {addr.phone}

                          <br />

                          {
                            [
                              addr.address_line,
                              addr.city,
                              `${addr.state} ${addr.pincode}`,
                            ].filter(Boolean).join(
                              ", ",
                            )
                          }
                        </div>

                        {
                          addr.is_default && (

                            <span className="checkout-address-badge">
                              Default
                            </span>
                          )
                        }
                      </div>
                    </label>
                  );
                },
              )
            }

            <div className="checkout-address-actions">

              <Link to="/profile/addresses">
                Add or edit addresses
              </Link>
            </div>
          </div>
        )
      }
    </section>
  );
}
