import "../../styles/about.css";

import { ArrowDown, Leaf, Phone, Recycle } from "lucide-react";

import { Link } from "react-router-dom";

import PublicNavbar from "../../components/common/PublicNavbar.jsx";

const JOURNEY_STEPS = [
  {
    step: "01",
    title: "Ethical Selection",
    text: "We partner with certified forests and local mills to source timber with documented provenance. Every slab is chosen for grain character, structural integrity, and the story it will carry into your home.",
    image:
      "https://tse3.mm.bing.net/th/id/OIP.28EMIO6KSZFBM6w9FHs3vQHaE8?pid=ImgDet&w=474&h=316&rs=1&o=7&rm=3",
    reverse: false,
  },
  {
    step: "02",
    title: "The Master's Touch",
    text: "Our furnicarts shape each piece by hand — joinery, sanding, and finishing guided by decades of craft. No shortcuts, no mass-production templates. Only deliberate work that honors the material.",
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1200&auto=format&fit=crop",
    reverse: true,
  },
  {
    step: "03",
    title: "The Final Refinement",
    text: "Before any piece leaves our workshop, it passes a rigorous quality review — surface feel, structural balance, and finish depth. What arrives at your door is ready to become part of your legacy.",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1200&auto=format&fit=crop",
    reverse: false,
  },
];

const LOCATIONS = [
  {
    city: "Manhattan Flagship",
    region: "New York, NY",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
  },
  {
    city: "Copenhagen Atelier",
    region: "Copenhagen, DK",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
  },
  {
    city: "Aoyama Studio",
    region: "Tokyo, JP",
    image:
      "https://images.unsplash.com/photo-1615529328331-f8917597711f?q=80&w=1200&auto=format&fit=crop",
  },
];

export default function About() {
  const scrollToStory = () => {
    document.getElementById("about-philosophy")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="about-page">
      <PublicNavbar />

      <section className="about-hero">
        <img
          className="about-hero-bg"
          src="https://tse1.mm.bing.net/th/id/OIP.avOBx6T2BOiKdoh0JHlmigHaE9?w=506&h=339&rs=1&pid=ImgDetMain&o=7&rm=3"
          alt=""
        />

        <div className="about-hero-overlay" />

        <div className="about-hero-content">
          <h1 className="about-hero-title">
            Crafting Legacies,
            <br />
            One Piece at a Time.
          </h1>

          <p className="about-hero-lead">
            FurniCart was founded on a simple belief: furniture should outlast
            trends, anchor memories, and grow more beautiful with every year
            spent in your home.
          </p>

          <button
            type="button"
            className="about-hero-cta"
            onClick={scrollToStory}
          >
            Explore Our Story
            <ArrowDown size={18} />
          </button>
        </div>
      </section>

      <section id="about-philosophy" className="about-philosophy">
        <blockquote className="about-quote">
          <p>
            &ldquo;In an era of disposable trends, we choose the deliberate path
            of longevity. We don&apos;t just build furniture; we curate the
            tactile history of your home.&rdquo;
          </p>

          <footer>— THE FOUNDERS</footer>
        </blockquote>

        <div className="about-philosophy-text">
          <p>
            Every FurniCart collection begins with a question: will this piece
            still feel essential a decade from now? We design for calm
            interiors, honest materials, and the quiet confidence of
            craftsmanship you can see and feel.
          </p>

          <p>
            From sustainably sourced hardwoods to hand-applied finishes, our
            process respects both the maker and the home it eventually inhabits.
            This is furniture meant to be lived with — not replaced.
          </p>
        </div>
      </section>

      <section className="about-journey">
        <h2 className="about-section-title">The Furnicart Journey</h2>

        <div className="about-journey-list">
          {JOURNEY_STEPS.map((item) => (
            <article
              key={item.step}
              className={
                item.reverse
                  ? "about-journey-row about-journey-row--reverse"
                  : "about-journey-row"
              }
            >
              <div className="about-journey-media">
                <img src={item.image} alt="" />
              </div>

              <div className="about-journey-copy">
                <span className="about-journey-step">{item.step}</span>

                <h3>{item.title}</h3>

                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-sustainability-wrap">
        <div className="about-sustainability">
          <div className="about-sustainability-copy">
            <h2>Sustainability is the Soul of Design</h2>

            <p>
              We measure success not only by how a piece looks on delivery day,
              but by the footprint it leaves behind. Responsible sourcing,
              low-waste workshops, and repairable construction are
              non-negotiable parts of every collection.
            </p>

            <ul className="about-sustainability-features">
              <li>
                <span className="about-feature-icon">
                  <Leaf size={18} />
                </span>

                <div>
                  <strong>Responsible Design</strong>

                  <p>Certified materials and transparent supply chains.</p>
                </div>
              </li>

              <li>
                <span className="about-feature-icon">
                  <Recycle size={18} />
                </span>

                <div>
                  <strong>Built to Last</strong>

                  <p>heirloom-grade joinery that rewards care over decades.</p>
                </div>
              </li>
            </ul>
          </div>

          <aside className="about-impact-card">
            <h3>Annual Impact</h3>

            <div className="about-impact-row">
              <div className="about-impact-label">
                <span>Renewable Materials</span>

                <strong>92%</strong>
              </div>

              <div className="about-impact-bar">
                <span style={{ width: "92%" }} />
              </div>
            </div>

            <div className="about-impact-row">
              <div className="about-impact-label">
                <span>Zero Waste Production</span>

                <strong>85%</strong>
              </div>

              <div className="about-impact-bar">
                <span style={{ width: "85%" }} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="about-locations">
        <p className="about-eyebrow">Locations</p>

        <h2 className="about-section-title">
          Experience the Quality in Person
        </h2>

        <div className="about-location-grid">
          {LOCATIONS.map((loc) => (
            <article key={loc.city} className="about-location-card">
              <img src={loc.image} alt="" />

              <div className="about-location-meta">
                <h3>{loc.city}</h3>

                <p>{loc.region}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-final-cta">
        <h2>Begin Your Own Legacy</h2>

        <p>
          Discover the perfect piece for your journey with our curated selection
          of collections.
        </p>

        <div className="about-final-cta-actions">
          <Link to="/contact" className="about-btn about-btn--light">
            Find a Showroom
          </Link>

          <Link to="/shop" className="about-btn about-btn--outline">
            Request a Catalog
          </Link>
        </div>
      </section>

      <footer className="about-footer">
        <div className="about-footer-brand">FurniCart</div>

        <nav className="about-footer-links">
          <Link to="/about">Sustainability</Link>

          <Link to="/about">Warranty Policy</Link>

          <Link to="/about">Technical Resources</Link>

          <Link to="/about">Returns</Link>

          <Link to="/about">Care Guide</Link>
        </nav>

        <div className="about-footer-social">
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Pinterest"
          >
            <span className="about-pinterest-mark">P</span>
          </a>

          <a href="tel:+18005551234" aria-label="Phone">
            <Phone size={18} />
          </a>
        </div>

        <p className="about-footer-copy">
          © {new Date().getFullYear()} FurniCart. Crafted for Longevity.
        </p>
      </footer>
    </div>
  );
}
