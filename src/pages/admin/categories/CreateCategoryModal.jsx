import "../../../styles/createcategorymodal.css";

import {
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  X,
  ImagePlus,
  ChevronDown,
  Check,
} from "lucide-react";

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

  const handleImageChange =
    (e) => {

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

        setFormData({

          name: "",

          parent: "",

          description: "",

          image: null,
        });

        setPreview(null);

        onClose();
      }
    };

  if (!isOpen) return null;

  return (

    <div className="category-modal-overlay">

      <div className="category-modal">

        {/* HEADER */}

        <div className="category-modal-header">

          <div>

            <h2>

              New Category

            </h2>

            <p>

              Define a new category for your
              furniture collection.

            </p>

          </div>

          <button
            onClick={onClose}
            className="close-btn"
          >

            <X size={28} />

          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="category-form"
        >

          {/* GRID */}

          <div className="category-grid">

            {/* NAME */}

            <div className="form-group">

              <label>

                Category Name

              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Minimalist Desks"
                required
              />

            </div>

            {/* PARENT */}

            <div className="form-group">

              <label>

                Parent Category

              </label>

              <div className="select-wrapper">

                <select
                  name="parent"
                  value={formData.parent}
                  onChange={handleChange}
                >

                  <option value="">
                    None
                  </option>

                  {
                    categories.map(
                      (category) => (

                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      )
                    )
                  }

                </select>

                <ChevronDown
                  size={18}
                  className="select-icon"
                />

              </div>

            </div>

          </div>

          {/* DESCRIPTION */}

          <div className="form-group">

            <label>

              Description

            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe the design philosophy and materials of this category..."
            />

          </div>

          {/* IMAGE */}

          <div className="form-group">

            <label>

              Category Image

            </label>

            <div
              className="image-upload-box"
              onClick={() =>
                document
                  .getElementById(
                    "category-image-input"
                  )
                  ?.click()
              }
            >

              <input
                id="category-image-input"
                type="file"
                accept="image/*"
                hidden
                onChange={
                  handleImageChange
                }
              />

              {
                preview ? (

                  <img
                    src={preview}
                    alt="Preview"
                    className="preview-image"
                  />

                ) : (

                  <div className="upload-content">

                    <div className="upload-icon-box">

                      <ImagePlus size={46} />

                    </div>

                    <div className="upload-btn">

                      Upload Image

                    </div>

                    <p>

                      High-resolution JPEG or PNG.
                      Max 5MB.

                    </p>

                  </div>
                )
              }

            </div>

          </div>

          {/* FOOTER */}

          <div className="category-modal-footer">

            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >

              Cancel

            </button>

            <button
              type="submit"
              disabled={categoryLoading}
              className="submit-button"
            >

              <Check size={18} />

              {
                categoryLoading

                  ? "Creating..."

                  : "Create Category"
              }

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}