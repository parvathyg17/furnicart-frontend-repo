export default function QuantityStepper({
  id,
  label,
  value,
  min = 1,
  max = 1,
  disabled = false,
  onChange,
}) {
  const num = Math.min(max, Math.max(min, Number(value) || min));

  return (
    <div className="order-qty-stepper">
      <label className="order-cancel-label" htmlFor={id}>
        {label}
      </label>

      <div className="order-qty-stepper-row">
        <button
          type="button"
          className="order-qty-stepper-btn"
          disabled={disabled || num <= min}
          aria-label="Decrease quantity"
          onClick={() => {
            onChange(num - 1);
          }}
        >
          −
        </button>

        <input
          id={id}
          className="order-qty-stepper-input"
          type="number"
          min={min}
          max={max}
          value={num}
          disabled={disabled}
          onChange={(e) => {
            onChange(Number(e.target.value));
          }}
        />

        <button
          type="button"
          className="order-qty-stepper-btn"
          disabled={disabled || num >= max}
          aria-label="Increase quantity"
          onClick={() => {
            onChange(num + 1);
          }}
        >
          +
        </button>

        <span className="order-qty-stepper-max">of {max}</span>
      </div>
    </div>
  );
}
