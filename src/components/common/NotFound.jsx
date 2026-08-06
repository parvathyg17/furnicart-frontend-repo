import "../../styles/notfound.css";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-media">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop"
            alt="Minimalist elegant armchair in an empty room representing a 404 page"
            className="notfound-img"
          />
        </div>

        <div className="notfound-text-section">
          <h1 className="notfound-error-code">404</h1>

          <h2 className="notfound-title">Lost in the Showroom?</h2>

          <p className="notfound-desc">
            Page Not Found
          </p>

          <Link to="/" className="notfound-btn">
            Back to Homepage <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
