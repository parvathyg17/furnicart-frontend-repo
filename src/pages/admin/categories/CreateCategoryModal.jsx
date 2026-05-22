import {
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {

  createCategory,
  getAdminCategories,

} from "../../../features/catalog/category/categorySlice";

export default function CreateCategoryModal({

  isOpen,
  onClose,

}) {

  const dispatch = useDispatch();

  const {

    categories,
    categoryLoading,

  } = useSelector(
    (state) => state.category
  );

  const [formData, setFormData] =
    useState({

      name: "",

      parent: "",

      description: "",

      image: null,
    });

  const [preview, setPreview] =
    useState(null);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {

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
  // HANDLE IMAGE
  // ==========================================

  const handleImageChange = (
    e
  ) => {

    const file =
      e.target.files[0];

    if (!file) return;

    setFormData((prev) => ({

      ...prev,

      image: file,
    }));

    setPreview(
      URL.createObjectURL(file)
    );
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const submitData =
        new FormData();

      submitData.append(
        "name",
        formData.name
      );

      submitData.append(
        "description",
        formData.description
      );

      if (formData.parent) {

        submitData.append(
          "parent",
          formData.parent
        );
      }

      if (formData.image) {

        submitData.append(
          "image",
          formData.image
        );
      }

      const result =
        await dispatch(
          createCategory(
            submitData
          )
        );

      if (
        createCategory.fulfilled.match(
          result
        )
      ) {

        dispatch(
          getAdminCategories()
        );

        onClose();

        setFormData({

          name: "",

          parent: "",

          description: "",

          image: null,
        });

        setPreview(null);
      }
    };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-2xl p-6">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-xl font-bold">

            Create Category

          </h2>

          <button
            onClick={onClose}
            className="text-gray-500"
          >
            ✕
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* NAME */}

          <div>

            <label className="block mb-1 font-medium">

              Name

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

          {/* PARENT */}

          <div>

            <label className="block mb-1 font-medium">

              Parent Category

            </label>

            <select
              name="parent"
              value={formData.parent}
              onChange={handleChange}
              className="w-full border rounded-lg p-3"
            >

              <option value="">
                No Parent
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

          {/* DESCRIPTION */}

          <div>

            <label className="block mb-1 font-medium">

              Description

            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full border rounded-lg p-3"
            />

          </div>

          {/* IMAGE */}

          <div>

            <label className="block mb-1 font-medium">

              Category Image

            </label>

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
            />

          </div>

          {/* PREVIEW */}

          {preview && (

            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 rounded-lg object-cover"
            />

          )}

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={categoryLoading}
              className="px-4 py-2 bg-black text-white rounded-lg"
            >

              {categoryLoading
                ? "Creating..."
                : "Create"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}