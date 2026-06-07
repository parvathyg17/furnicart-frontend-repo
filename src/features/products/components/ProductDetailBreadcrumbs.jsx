import {
  Link,
} from "react-router-dom";

export default function ProductDetailBreadcrumbs(
  {
    product,
  },
) {

  return (

    <nav
      className="pd-user-breadcrumbs"
      aria-label="Breadcrumb"
    >

      <Link to="/">
        Home
      </Link>

      <span
        className="pd-user-bc-sep"
        aria-hidden="true"
      >
        /
      </span>

      <Link to="/shop">
        Shop
      </Link>

      {
        (product.breadcrumbs || []).map(
          (b) => (

            <span key={b.id}>

              <span
                className="pd-user-bc-sep"
                aria-hidden="true"
              >
                /
              </span>

              <Link
                to={`/shop?category=${encodeURIComponent(b.slug)}`}
              >
                {b.name}
              </Link>
            </span>
          )
        )
      }

      <span
        className="pd-user-bc-sep"
        aria-hidden="true"
      >
        /
      </span>

      <span
        className="pd-user-bc-current"
        aria-current="page"
      >
        {product.name}
      </span>
    </nav>
  );
}
