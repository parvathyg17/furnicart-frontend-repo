import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Leaf,
  Share2,
  Globe,
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../components/common/PublicNavbar.jsx";
import { submitContactMessage } from "../../features/contact/contactAPI.js";
import "../../styles/contact.css";
export default function Contact() {
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
    email: user ? user.email || "" : "",
    subject: "Bespoke Commission Inquiry",
    message: "",
  });

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const data = await submitContactMessage(formData);
      setStatus("success");
      setSuccessMsg(
        data.message ||
          "Thank you for reaching out! Your message has been sent successfully.",
      );
      setFormData({
        name: user
          ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
          : "",
        email: user ? user.email || "" : "",
        subject: "Bespoke Commission Inquiry",
        message: "",
      });
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err.response?.data?.detail ||
          "An error occurred while sending your message. Please try again.",
      );
    }
  };

  return (
    <div className="contact-page">
      <PublicNavbar />

      <header className="contact-header">
        <div className="contact-header-inner">
          <span className="contact-eyebrow">Bespoke Assistance</span>
          <h1>Contact Our Concierge</h1>
          <p>
            Our dedicated concierge team is available to guide you through our
            collections, assist with custom commissions, and provide expert
            insight into the artistry of Furnicart.
          </p>
        </div>
      </header>

      <main className="contact-main">
        {/* Left Column: Form */}
        <section className="contact-form-section">
          <div className="contact-form-card">
            {status === "success" && (
              <div className="contact-alert contact-alert--success">
                {successMsg}
              </div>
            )}

            {status === "error" && (
              <div className="contact-alert contact-alert--error">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label htmlFor="name" className="contact-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="contact-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Elias Thorne"
                  />
                </div>
                <div className="contact-form-group">
                  <label htmlFor="email" className="contact-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="contact-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="elias@example.com"
                  />
                </div>
              </div>

              <div className="contact-form-group">
                <label htmlFor="subject" className="contact-label">
                  Inquiry Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="contact-select"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option value="Bespoke Commission Inquiry">
                    Bespoke Commission Inquiry
                  </option>
                  <option value="Order Status & Tracking">
                    Order Status & Tracking
                  </option>
                  <option value="Product Care & Maintenance">
                    Product Care & Maintenance
                  </option>
                  <option value="Showroom Appointments">
                    Showroom Appointments
                  </option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div className="contact-form-group">
                <label htmlFor="message" className="contact-label">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  className="contact-textarea"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Describe how we may assist you..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="contact-submit-btn"
              >
                {status === "loading" ? "Sending..." : "Send Inquiry"}
                <ArrowUpRight size={16} />
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: Info */}
        <section className="contact-info-section">
          <div className="contact-info-wrap">
            <img
              src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=1200&auto=format&fit=crop"
              alt="Atelier workspace"
              className="contact-info-image"
            />

            <div>
              <span className="contact-eyebrow">The Atelier</span>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-icon-wrapper">
                    <Phone size={20} strokeWidth={1.5} />
                  </div>
                  <div className="contact-info-content">
                    <h3>Concierge Phone</h3>
                    <div className="contact-info-value">+1 (212) 555-0198</div>
                    <div className="contact-info-sub">
                      Mon — Fri, 9am — 6pm EST
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-wrapper">
                    <Mail size={20} strokeWidth={1.5} />
                  </div>
                  <div className="contact-info-content">
                    <h3>Email Inquiries</h3>
                    <div className="contact-info-value">
                      concierge@furnicart.com
                    </div>
                    <div className="contact-info-sub">
                      Average response: 2 hours
                    </div>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-wrapper">
                    <MapPin size={20} strokeWidth={1.5} />
                  </div>
                  <div className="contact-info-content">
                    <h3>Showroom Address</h3>
                    <div className="contact-info-value">
                      420 Design District
                    </div>
                    <div className="contact-info-sub">
                      Manhattan, New York, 10014
                      <br />
                      United States
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-sustainability-box">
              <Leaf size={20} strokeWidth={1.5} />
              <p>
                Looking for material care guides? Our sustainability experts
                have prepared comprehensive documents for all walnut and linen
                pieces.
              </p>
            </div>
          </div>
        </section>
      </main>

      <section className="contact-philosophy">
        <div className="contact-separator-line"></div>
        <span className="contact-eyebrow">Furnicart Philosophy</span>
        <blockquote>
          "True luxury is not in the abundance of things, but in the
          intentionality of every line, the soul of the material, and the quiet
          attention to every detail."
        </blockquote>
        <div className="contact-philosophy-bar"></div>
      </section>

      <footer className="contact-footer">
        <div className="contact-footer-brand">Furnicart</div>
        <nav className="contact-footer-links">
          <Link to="/">Sustainability</Link>
          <Link to="/">Shipping Policy</Link>
          <Link to="/">Terms of Service</Link>
          <Link to="/">Privacy</Link>
          <Link to="/">Care Guide</Link>
        </nav>
        <div className="contact-footer-social">
          <a href="#" aria-label="Share">
            <Share2 size={18} />
          </a>
          <a href="#" aria-label="Globe">
            <Globe size={18} />
          </a>
          <a href="#" aria-label="Email">
            <Mail size={18} />
          </a>
        </div>
        <p className="contact-footer-copy">
          © {new Date().getFullYear()} Furnicart. Crafted for Longevity.
        </p>
      </footer>
    </div>
  );
}
