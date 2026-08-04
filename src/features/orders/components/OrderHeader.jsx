import { Link } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

export default function OrderHeader() {
  return (
    <nav className="odl-back" aria-label="Breadcrumb">
      <Link to="/orders" className="odl-back-link">
        <ArrowLeft size={16} aria-hidden />
        Back to my orders
      </Link>
    </nav>
  );
}
