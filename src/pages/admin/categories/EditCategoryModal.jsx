import "../../../styles/createcategorymodal.css";

import {
  useEffect,
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
  Pencil,
} from "lucide-react";

import {

  updateCategory,
  getAdminCategories,

} from "../../../features/catalog/category/categorySlice";

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
  // LOAD CATEGORY
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

        category.image_url ||

        category.image ||

        null
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

  const handleImageChange =
    (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      if (
        file.size >
        5 * 1024 * 1024
      ) {

        alert(
          "Image must be below 5MB"
        );

        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "Only image files allowed"
        );

        return;
      }

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

      if (
        formData.parent &&
        formData.parent !== ""
      ) {

        submitData.append(
          "parent",
          parseInt(
            formData.parent
          )
        );
      }

      if (
        formData.image instanceof File
      ) {

        submitData.append(
          "image",
          formData.image
        );
      }

      try {

        const result =
          await dispatch(
            updateCategory({

              categoryId:
                category.id,

              data:
                submitData,
            })
          ).unwrap();

        console.log(result);

        dispatch(
          getAdminCategories()
        );

        onClose();

      } catch (error) {

        console.log(error);

        alert(

          JSON.stringify(
            error,
            null,
            2
          )
        );
      }
    };

  if (!isOpen || !category)
    return null;

  return (

    <div className="category-modal-overlay">

      <div className="category-modal">

        {/* HEADER */}

        <div className="category-modal-header">

          <div>

            <h2>

              Edit Category

            </h2>

            <p>

              Update category information,
              hierarchy and visual identity.

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
          encType="multipart/form-data"
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
                placeholder="e.g. Scandinavian Lounge"
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
                    categories

                      .filter(
                        (item) =>
                          item.id !==
                          category.id
                      )

                      .map((item) => (

                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.name}
                        </option>
                      ))
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
              placeholder="Describe this category and its furniture style..."
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
                    "edit-category-image-input"
                  )
                  ?.click()
              }
            >

              <input
                id="edit-category-image-input"
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

              <Pencil size={18} />

              {
                categoryLoading

                  ? "Updating..."

                  : "Update Category"
              }

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}