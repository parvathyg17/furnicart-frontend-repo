import {
  Link,
} from "react-router-dom";

export default function OrderDetailToolbar() {

  return (

    <div className="odl-toolbar-links">

      <Link to="/orders">
        My orders
      </Link>

      <Link to="/purchases">
        My purchases
      </Link>

      <Link to="/shop">
        Continue shopping
      </Link>
    </div>
  );
}
