import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {

  updateCategory,
  getAdminCategories,

} from "../../../features/catalog/catalogSlice";

export default function EditCategoryModal({

  isOpen,
  onClose,
  category,

}) {

  const dispatch = useDispatch();

  const {

    categories,
    categoryLoading,

  } = useSelector(
    (state) => state.catalog
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
  // LOAD CATEGORY DATA
  // ==========================================

  useEffect(() => {

    if (category) {

      setFormData({

        name:
          category.name || "",

        parent:
          category.parent || "",

        description:
          category.description || "",

        image: null,
      });

      setPreview(
        category.image || null
      );
    }

  }, [category]);

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
          updateCategory({

            categoryId:
              category.id,

            data:
              submitData,
          })
        );

      if (
        updateCategory.fulfilled.match(
          result
        )
      ) {

        dispatch(
          getAdminCategories()
        );

        onClose();
      }
    };

  if (!isOpen || !category)
    return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-2xl p-6">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-xl font-bold">

            Edit Category

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

              {categories

                .filter(
                  (item) =>
                    item.id !== category.id
                )

                .map((item) => (

                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}

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
                ? "Updating..."
                : "Update"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}