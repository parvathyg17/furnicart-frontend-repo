import "../../../styles/createcategorymodal.css";

import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { X, ImagePlus, ChevronDown, Pencil } from "lucide-react";

import {
  updateCategory,
  getCategoryOptions,
} from "../../../features/catalog/category/categorySlice";

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}) {
  const dispatch = useDispatch();

  const { categoryOptions, categoryUpdateLoading } = useSelector(
    (state) => state.category,
  );

  const [formData, setFormData] = useState({
    name: "",

    parent: "",

    description: "",

    image: null,
  });

  const [preview, setPreview] = useState(null);

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",

        parent: category.parent || "",

        description: category.description || "",

        image: null,
      });

      setPreview(category.image_url || category.image || null);

      setFormErrors({});
    }
  }, [category]);

  useEffect(() => {
    if (isOpen) {
      dispatch(getCategoryOptions());
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormErrors((prev) => ({
      ...prev,

      [name]: "",
    }));

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormErrors((prev) => ({
      ...prev,

      image: "",
    }));

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,

        image: "Image must be below 5MB",
      }));

      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,

        image: "Only image files allowed",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,

      image: file,
    }));

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormErrors({});

    const submitData = new FormData();

    submitData.append("name", formData.name);

    submitData.append("description", formData.description);

    if (formData.parent && formData.parent !== "") {
      submitData.append("parent", parseInt(formData.parent));
    }

    if (formData.image instanceof File) {
      submitData.append("image", formData.image);
    }

    try {
      await dispatch(
        updateCategory({
          categoryId: category.id,

          data: submitData,
        }),
      ).unwrap();

      onSuccess?.();

      onClose();
    } catch (error) {
      setFormErrors(error);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="category-modal-overlay">
      <div className="category-modal">
        <div className="category-modal-header">
          <div>
            <h2>Edit Category</h2>

            <p>Update category information, hierarchy and visual identity.</p>
          </div>

          <button onClick={onClose} className="close-btn">
            <X size={28} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="category-form"
          encType="multipart/form-data"
        >
          <div className="category-grid">
            <div className="form-group">
              <label>Category Name</label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Scandinavian Lounge"
                required
                className={formErrors.name ? "input-error" : ""}
              />

              {formErrors.name && (
                <p className="field-error">{formErrors.name}</p>
              )}
            </div>

            <div className="form-group">
              <label>Parent Category</label>

              <div className="select-wrapper">
                <select
                  name="parent"
                  value={formData.parent}
                  onChange={handleChange}
                  className={formErrors.parent ? "input-error" : ""}
                >
                  <option value="">None</option>

                  {categoryOptions

                    .filter((item) => item.id !== category.id)

                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>

                <ChevronDown size={18} className="select-icon" />
              </div>

              {formErrors.parent && (
                <p className="field-error">{formErrors.parent}</p>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe this category and its furniture style..."
              className={formErrors.description ? "input-error" : ""}
            />

            {formErrors.description && (
              <p className="field-error">{formErrors.description}</p>
            )}
          </div>

          <div className="form-group">
            <label>Category Image</label>

            <div
              className={`image-upload-box ${
                formErrors.image ? "input-error" : ""
              }`}
              onClick={() =>
                document.getElementById("edit-category-image-input")?.click()
              }
            >
              <input
                id="edit-category-image-input"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />

              {preview ? (
                <img src={preview} alt="Preview" className="preview-image" />
              ) : (
                <div className="upload-content">
                  <div className="upload-icon-box">
                    <ImagePlus size={46} />
                  </div>

                  <div className="upload-btn">Upload Image</div>

                  <p>High-resolution JPEG or PNG. Max 5MB.</p>
                </div>
              )}
            </div>

            {formErrors.image && (
              <p className="field-error">{formErrors.image}</p>
            )}
          </div>

          <div className="category-modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>

            <button
              type="submit"
              disabled={categoryUpdateLoading}
              className="submit-button"
            >
              <Pencil size={18} />

              {categoryUpdateLoading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
