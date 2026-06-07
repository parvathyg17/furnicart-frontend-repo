export default function ProductDetailFooter() {

  return (

    <footer className="artisan-footer artisan-footer-pdp">

      <div className="artisan-footer-inner artisan-footer-pdp-inner">

        <div className="artisan-footer-pdp-links">

          <span>
            Sustainability
          </span>

          <span>
            Craftsmanship
          </span>

          <span>
            Shipping
          </span>
        </div>

        <p className="artisan-footer-copy artisan-footer-pdp-copy">
          © {new Date().getFullYear()} FurniCart. Crafted for longevity.
        </p>
      </div>
    </footer>
  );
}
