import {
  Link,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  ShoppingCart,
} from "lucide-react";

export default function NavCartLink(
  {
    user,
    className = "profile-nav-link",
  },
) {

  const itemCount = useSelector(
    (state) => state.cart.itemCount,
  );

  const badge =
    user && itemCount > 0
      ? (
        itemCount > 99
          ? "99+"
          : String(
            itemCount,
          )
      )
      : null;

  return (

    <Link
      to={
        user
          ? "/cart"
          : "/login"
      }
      className={className}
      aria-label={
        badge
          ? `Cart, ${itemCount} items`
          //  ? `Cart, ${itemCount} products`
          : "Cart"
      }
    >

      <span className="nav-cart-icon-wrap">

        <ShoppingCart size={20} />

        {
          badge && (

            <span
              className="nav-cart-badge"
              aria-hidden="true"
            >

              {badge}
            </span>
          )
        }

      </span>
    </Link>
  );
}
