import {
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  createProduct,
  getAdminProducts,
} from "../../../features/catalog/product/productSlice";

export default function CreateProductModal({

  isOpen,
  onClose,

}) {

  const dispatch = useDispatch();

  // ==========================================
  // REDUX STATE
  // ==========================================

  const {

    productLoading,

  } = useSelector(
    (state) => state.product
  );

  const {

    categories,

  } = useSelector(
    (state) => state.category
  );

  const {

    roomTypes,

  } = useSelector(
    (state) => state.roomType
  );

  // ==========================================
  // FORM STATE
  // ==========================================

  const [formData, setFormData] =
    useState({

      name: "",

      category: "",

      room_type: "",

      description: "",
    });

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const result =
        await dispatch(
          createProduct(formData)
        );

      if (
        createProduct.fulfilled.match(
          result
        )
      ) {

        dispatch(
          getAdminProducts()
        );

        setFormData({

          name: "",

          category: "",

          room_type: "",

          description: "",
        });

        onClose();
      }
    };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-2xl rounded-2xl p-6">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold">

            Create Product

          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 text-xl"
          >
            ✕
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* PRODUCT NAME */}

          <div>

            <label className="block mb-2 font-medium">

              Product Name

            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            />

          </div>

          {/* CATEGORY */}

          <div>

            <label className="block mb-2 font-medium">

              Category

            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            >

              <option value="">
                Select Category
              </option>

              {categories.map(
                (category) => (

                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* ROOM TYPE */}

          <div>

            <label className="block mb-2 font-medium">

              Room Type

            </label>

            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3"
            >

              <option value="">
                Select Room Type
              </option>

              {roomTypes.map(
                (roomType) => (

                  <option
                    key={roomType.id}
                    value={roomType.id}
                  >
                    {roomType.name}
                  </option>
                )
              )}

            </select>

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="block mb-2 font-medium">

              Description

            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full border rounded-lg p-3"
            />

          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={productLoading}
              className="px-5 py-2 bg-black text-white rounded-lg"
            >

              {productLoading
                ? "Creating..."
                : "Create Product"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}