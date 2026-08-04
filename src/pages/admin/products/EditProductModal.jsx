import "../../../styles/createproductmodal.css";

import CreateCategoryModal from "../categories/CreateCategoryModal";

import CreateRoomTypeModal from "../roomType/CreateRoomTypeModal";

import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { X, ChevronDown } from "lucide-react";

import {
  updateProduct,
  clearProductMessages,
} from "../../../features/catalog/product/productSlice";

import { mapPayloadToFormErrors } from "../../../utils/productApiErrors.js";

import { getAdminCategories } from "../../../features/catalog/category/categorySlice";

import { getAdminRoomTypes } from "../../../features/catalog/roomType/roomTypeSlice";

export default function EditProductModal({ isOpen, onClose, product }) {
  const dispatch = useDispatch();

  const { productLoading } = useSelector((state) => state.product);

  const { categories } = useSelector((state) => state.category);

  const { roomTypes } = useSelector((state) => state.roomType);

  const [formData, setFormData] = useState({
    name: "",

    description: "",

    category: "",

    room_type_ids: [],

    is_featured: false,

    is_active: true,
  });

  const [formErrors, setFormErrors] = useState({});

  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);

  const [showCreateRoomTypeModal, setShowCreateRoomTypeModal] = useState(false);

  // ==========================================
  // FETCH DATA
  // ==========================================

  useEffect(() => {
    if (!isOpen) return;

    dispatch(clearProductMessages());

    setFormErrors({});

    dispatch(
      getAdminCategories({
        page: 1,

        page_size: 1000,
      }),
    );

    dispatch(
      getAdminRoomTypes({
        page: 1,

        page_size: 1000,

        is_active: true,
      }),
    );
  }, [dispatch, isOpen]);

  // ==========================================
  // PREFILL FORM
  // ==========================================

  useEffect(() => {
    if (!product) return;

    const rawCategory = product.category;

    const categoryId =
      rawCategory == null || rawCategory === ""
        ? ""
        : typeof rawCategory === "object"
          ? String(rawCategory.id ?? "")
          : String(rawCategory);

    setFormData({
      name: product.name || "",

      description: product.description || "",

      category: categoryId,

      room_type_ids: product.room_types?.map((item) => item.id) || [],

      is_featured: product.is_featured || false,

      is_active: product.is_active ?? true,
    });
  }, [product]);

  // ==========================================
  // VALIDATE (CLIENT)
  // ==========================================

  const validateClient = () => {
    const next = {};

    if (!formData.name.trim()) {
      next.name = "Product name is required.";
    }

    if (!formData.description.trim()) {
      next.description = "Description is required.";
    }

    if (!formData.category) {
      next.category = "Select a category.";
    }

    if (!formData.room_type_ids || formData.room_type_ids.length < 1) {
      next.room_type_ids = "Select at least one room type.";
    }

    setFormErrors(next);

    return Object.keys(next).length === 0;
  };

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));

    setFormErrors((prev) => ({
      ...prev,

      [name]: "",
    }));
  };

  const handleRoomTypeToggle = (roomTypeId, checked) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,

        room_type_ids: [...new Set([...prev.room_type_ids, roomTypeId])],
      }));

      setFormErrors((prev) => ({
        ...prev,

        room_type_ids: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,

        room_type_ids: prev.room_type_ids.filter((id) => id !== roomTypeId),
      }));
    }
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateClient()) {
      return;
    }

    try {
      await dispatch(
        updateProduct({
          productId: product.id,

          data: formData,
        }),
      ).unwrap();

      onClose();
    } catch (err) {
      setFormErrors(mapPayloadToFormErrors(err));
    }
  };

  // ==========================================
  // CLOSE
  // ==========================================

  if (!isOpen || !product) {
    return null;
  }

  return (
    <div className="create-product-overlay">
      <div className="create-product-modal">
        {/* HEADER */}

        <div className="create-product-header">
          <div>
            <h2>Edit Product</h2>

            <p>Refine and update your furniture collection details.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <X size={26} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          <div className="create-product-body">
            {formErrors._general && (
              <div className="form-error">{formErrors._general}</div>
            )}

            {Object.entries(formErrors)
              .filter(
                ([key, msg]) =>
                  msg &&
                  ![
                    "_general",
                    "name",
                    "description",
                    "category",
                    "room_type_ids",
                    "is_active",
                  ].includes(key),
              )
              .map(([key, msg]) => (
                <div key={key} className="form-error" role="alert">
                  {typeof msg === "string" ? msg : String(msg)}
                </div>
              ))}

            {/* PRODUCT NAME */}

            <div className="form-group">
              <label>PRODUCT NAME</label>

              <input
                type="text"
                name="name"
                placeholder="Product name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              {formErrors.name && (
                <div className="form-error">{formErrors.name}</div>
              )}
            </div>

            {/* CATEGORY + ROOM TYPE */}

            <div className="double-fields">
              {/* CATEGORY */}

              <div className="form-group">
                <div className="field-label-row">
                  <label>CATEGORY</label>

                  <button
                    type="button"
                    className="inline-create-link"
                    onClick={() => setShowCreateCategoryModal(true)}
                  >
                    + Create Category
                  </button>
                </div>

                <div className="select-wrapper">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>

                    {categories?.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {item.name}

                        {item.is_active ? "" : " (inactive)"}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={18} />
                </div>

                {formErrors.category && (
                  <div className="form-error">{formErrors.category}</div>
                )}
              </div>

              {/* ROOM TYPE */}

              <div className="form-group">
                <div className="field-label-row">
                  <label>ROOM TYPES</label>

                  <button
                    type="button"
                    className="inline-create-link"
                    onClick={() => setShowCreateRoomTypeModal(true)}
                  >
                    + Create Room Type
                  </button>
                </div>

                <div className="multi-room-grid">
                  {roomTypes
                    ?.filter((item) => item.is_active)
                    ?.map((item) => (
                      <label
                        key={item.id}
                        className={`room-type-chip ${
                          formData.room_type_ids.includes(item.id)
                            ? "active"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.room_type_ids.includes(item.id)}
                          onChange={(e) =>
                            handleRoomTypeToggle(
                              item.id,

                              e.target.checked,
                            )
                          }
                        />

                        <span>{item.name}</span>
                      </label>
                    ))}
                </div>

                {formErrors.room_type_ids && (
                  <div className="form-error">{formErrors.room_type_ids}</div>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="form-group">
              <label>DESCRIPTION</label>

              <textarea
                name="description"
                placeholder="Product description..."
                value={formData.description}
                onChange={handleChange}
                required
              />

              {formErrors.description && (
                <div className="form-error">{formErrors.description}</div>
              )}
            </div>

            {/* NOTE */}

            <div className="variant-note">
              <p>
                To set the product active, add at least one variants, three
                images per active variant, and complete all variant fields
                (name, SKU, color, material, size, price, stock). Price must be
                greater than zero and stock cannot be negative.
              </p>
            </div>
          </div>

          {/* FOOTER */}

          <div className="create-product-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={productLoading}
            >
              {productLoading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <CreateCategoryModal
        isOpen={showCreateCategoryModal}

        onClose={() => setShowCreateCategoryModal(false)}

        onSuccess={() => {
          dispatch(
            getAdminCategories({
              page: 1,

              page_size: 1000,

              is_active: true,
            }),
          );
        }}
      />

      <CreateRoomTypeModal
        isOpen={showCreateRoomTypeModal}

        onClose={() => setShowCreateRoomTypeModal(false)}

        onSuccess={() => {
          dispatch(
            getAdminRoomTypes({
              page: 1,

              page_size: 1000,

              is_active: true,
            }),
          );
        }}
      />
    </div>
  );
}
