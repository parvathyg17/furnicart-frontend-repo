import { Link } from "react-router-dom";

import { useSelector } from "react-redux";
import { Heart } from "lucide-react";

export default function NavWishlistLink({
  user,
  className = "profile-nav-link",
}) {
  const itemCount = useSelector((state) => state.wishlist.itemCount);

  const badge =
    user && itemCount > 0 ? (itemCount > 99 ? "99+" : String(itemCount)) : null;

  return (
    <Link
      to={user ? "/wishlist" : "/login"}
      className={className}
      aria-label={badge ? `Wishlist, ${itemCount} items` : "Wishlist"}
    >
      <span className="nav-cart-icon-wrap">
        <Heart size={20} />
        {badge && (
          <span className="nav-cart-badge" aria-hidden="true">
            {badge}
          </span>
        )}
      </span>
    </Link>
  );
}
