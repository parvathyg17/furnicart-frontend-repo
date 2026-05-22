export default function ProductTable({

  products,
  productLoading,
  onEdit,
  onDelete,

}) {

  return (

    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="text-left p-4">
              Product
            </th>

            <th className="text-left p-4">
              Category
            </th>

            <th className="text-left p-4">
              Room Type
            </th>

            <th className="text-left p-4">
              Variants
            </th>

            <th className="text-left p-4">
              Status
            </th>

            <th className="text-left p-4">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {productLoading ? (

            <tr>

              <td
                colSpan="6"
                className="p-6 text-center"
              >
                Loading...
              </td>

            </tr>

          ) : products.length === 0 ? (

            <tr>

              <td
                colSpan="6"
                className="p-6 text-center"
              >
                No products found
              </td>

            </tr>

          ) : (

            products.map(
              (product) => (

                <tr
                  key={product.id}
                  className={`border-t ${
                    !product.is_active
                      ? "opacity-50"
                      : ""
                  }`}
                >

                  {/* PRODUCT */}

                  <td className="p-4">

                    <div className="flex items-center gap-3">

                      {product.thumbnail ? (

                        <img
                          src={
                            product.thumbnail
                          }
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />

                      ) : (

                        <div className="w-16 h-16 rounded-lg bg-gray-200" />

                      )}

                      <div>

                        <p className="font-semibold">

                          {product.name}

                        </p>

                        <p className="text-sm text-gray-500">

                          {product.slug}

                        </p>

                      </div>

                    </div>

                  </td>

                  {/* CATEGORY */}

                  <td className="p-4">

                    {product.category_name || "-"}

                  </td>

                  {/* ROOM TYPE */}

                  <td className="p-4">

                    {product.room_type_name || "-"}

                  </td>

                  {/* VARIANTS */}

                  <td className="p-4">

                    {product.variants?.length || 0}

                  </td>

                  {/* STATUS */}

                  <td className="p-4">

                    {product.is_active ? (

                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">

                        Active

                      </span>

                    ) : (

                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">

                        Deleted

                      </span>

                    )}

                  </td>

                  {/* ACTIONS */}

                  <td className="p-4">

                    <div className="flex gap-2">

                      <button

                        onClick={() =>
                          onEdit(product)
                        }

                        className="px-3 py-1 bg-blue-500 text-white rounded"
                      >
                        Edit
                      </button>

                      {product.is_active && (

                        <button

                          onClick={() =>
                            onDelete(product.id)
                          }

                          className="px-3 py-1 bg-red-500 text-white rounded"
                        >
                          Delete
                        </button>

                      )}

                    </div>

                  </td>

                </tr>
              )
            )
          )}

        </tbody>

      </table>

    </div>
  );
}