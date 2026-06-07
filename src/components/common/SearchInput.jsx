import {
  Search,
  X,
} from "lucide-react";

/**
 * Search field with icon and optional clear control.
 */
export default function SearchInput(
  {
    value,
    onChange,
    onSubmit,
    onClear,
    placeholder = "Search…",
    className = "artisan-sidebar-search",
    inputProps = {},
  },
) {

  return (

    <div className={className}>

      <Search
        size={18}
        className="artisan-sidebar-search-icon"
      />

      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {

          if (
            e.key === "Enter" &&
            onSubmit
          ) {

            e.preventDefault();

            onSubmit();
          }
        }}
        {...inputProps}
      />

      {
        value && onClear
          ? (

            <button
              type="button"
              className="artisan-clear-search"
              aria-label="Clear"
              onClick={onClear}
            >

              <X size={16} />
            </button>
          )
          : null
      }
    </div>
  );
}
