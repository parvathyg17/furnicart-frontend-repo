import {
  Eye,
  Pencil,
  Trash2,
  Package,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

export default function ProductCard({

  product,
  onDelete,

}) {

  const navigate =
    useNavigate();

  return (

    <div
      className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition ${
        !product.is_active
          ? "opacity-60"
          : ""
      }`}
    >

      {/* IMAGE */}

      <div className="w-full h-56 bg-gray-100 overflow-hidden">

        {product.thumbnail ? (

          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
          />

        ) : (

          <div className="w-full h-full flex items-center justify-center">

            <Package
              size={48}
              className="text-gray-400"
            />

          </div>

        )}

      </div>

      {/* CONTENT */}

      <div className="p-5">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-3 mb-4">

          <div>

            <h2 className="text-lg font-semibold line-clamp-1">

              {product.name}

            </h2>

            <p className="text-sm text-gray-500 mt-1">

              {product.category_name || "No Category"}

            </p>

          </div>

          {/* STATUS */}

          {product.is_active ? (

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 whitespace-nowrap">

              Active

            </span>

          ) : (

            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 whitespace-nowrap">

              Deleted

            </span>

          )}

        </div>

        {/* DETAILS */}

        <div className="space-y-2 text-sm mb-5">

          <div className="flex items-center justify-between">

            <span className="text-gray-500">

              Room Type

            </span>

            <span className="font-medium">

              {product.room_type_name || "-"}

            </span>

          </div>

          <div className="flex items-center justify-between">

            <span className="text-gray-500">

              Variants

            </span>

            <span className="font-medium">

              {product.variants_count || 0}

            </span>

          </div>

          <div className="flex items-center justify-between">

            <span className="text-gray-500">

              Featured

            </span>

            <span className="font-medium">

              {product.is_featured
                ? "Yes"
                : "No"}

            </span>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="flex items-center gap-2">

          {/* VIEW */}

          <button

            onClick={() =>
              navigate(
                `/admin/products/${product.id}`
              )
            }

            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition"
          >

            <Eye size={16} />

            View

          </button>

          {/* EDIT */}

          <button

            onClick={() =>
              navigate(
                `/admin/products/${product.id}/edit`
              )
            }

            className="p-2 rounded-xl border hover:bg-gray-100 transition"
          >

            <Pencil size={18} />

          </button>

          {/* DELETE */}

          {product.is_active && (

            <button

              onClick={() =>
                onDelete(product.id)
              }

              className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition"
            >

              <Trash2 size={18} />

            </button>

          )}

        </div>

      </div>

    </div>
  );
}