import SearchInput from "../../../components/common/SearchInput.jsx";

import { SORT_OPTIONS } from "../shopConstants.js";

export default function ShopFiltersSidebar({
  categories,
  roomTypes,
  draftSearch,
  onDraftSearchChange,
  onApplySearch,
  onClearSearch,
  sort,
  onSortChange,
  category,
  onCategoryChange,
  roomType,
  onRoomTypeChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}) {
  return (
    <aside className="artisan-sidebar">
      <SearchInput
        value={draftSearch}
        onChange={(e) => {
          onDraftSearchChange(e.target.value);
        }}
        onSubmit={onApplySearch}
        onClear={onClearSearch}
        placeholder="Type to find pieces…"
      />

      <button
        type="button"
        className="artisan-sidebar-apply"
        onClick={onApplySearch}
      >
        Apply search
      </button>

      <div className="artisan-field-block">
        <span className="artisan-field-label">Sort by</span>

        <select
          className="artisan-select"
          value={sort}
          onChange={(e) => {
            onSortChange(e.target.value);
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="artisan-field-block">
        <span className="artisan-field-label">Category</span>

        <ul className="artisan-check-list">
          <li>
            <label className="artisan-check-row">
              <input
                type="radio"
                name="shop-category"
                checked={category === ""}
                onChange={() => {
                  onCategoryChange("");
                }}
              />

              <span>All</span>
            </label>
          </li>

          {categories.map((c) => (
            <li key={c.id}>
              <label className="artisan-check-row">
                <input
                  type="radio"
                  name="shop-category"
                  checked={category === c.slug}
                  onChange={() => {
                    onCategoryChange(c.slug);
                  }}
                />

                <span>{c.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="artisan-field-block">
        <span className="artisan-field-label">Room type</span>

        <ul className="artisan-room-list">
          <li>
            <button
              type="button"
              className={roomType === "" ? "is-active" : ""}
              onClick={() => {
                onRoomTypeChange("");
              }}
            >
              All
            </button>
          </li>

          {roomTypes.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className={roomType === r.slug ? "is-active" : ""}
                onClick={() => {
                  onRoomTypeChange(r.slug);
                }}
              >
                {r.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="artisan-field-block">
        <span className="artisan-field-label">Price range</span>

        <div className="artisan-price-row">
          <label>
            <span className="artisan-sr-only">Min</span>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Min"
              className="artisan-input"
              value={minPrice}
              onChange={(e) => {
                onMinPriceChange(e.target.value);
              }}
            />
          </label>

          <label>
            <span className="artisan-sr-only">Max</span>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Max"
              className="artisan-input"
              value={maxPrice}
              onChange={(e) => {
                onMaxPriceChange(e.target.value);
              }}
            />
          </label>
        </div>
      </div>
    </aside>
  );
}
