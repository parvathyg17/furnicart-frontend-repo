export default function ShopPageFooter() {
  return (
    <footer className="artisan-footer">
      <div className="artisan-footer-inner">
        <div>
          <strong className="artisan-font-serif">FurniCart</strong>

          <p className="artisan-footer-tag">
            Thoughtful furniture for everyday living.
          </p>
        </div>

        <div className="artisan-footer-links">
          <span>Sustainability</span>

          <span>Craftsmanship</span>

          <span>Shipping</span>
        </div>

        <p className="artisan-footer-copy">
          © {new Date().getFullYear()} FurniCart
        </p>
      </div>
    </footer>
  );
}
