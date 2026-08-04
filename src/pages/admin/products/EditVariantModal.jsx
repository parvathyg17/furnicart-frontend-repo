import "../../../styles/createvariantmodal.css";

import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { X, Pencil } from "lucide-react";

import {
  updateVariant,
  clearProductMessages,
  uploadVariantImage,
  deleteVariantImage,
  getAdminProductDetail,
} from "../../../features/catalog/product/productSlice";

import VariantMediaUploader from "../../../components/admin/products/VariantMediaUploader";

export default function EditVariantModal({ isOpen, onClose, variant }) {
  const dispatch = useDispatch();

  const { productLoading, productError } = useSelector(
    (state) => state.product,
  );

  // ==========================================
  // FORM
  // ==========================================

  const [formData, setFormData] = useState({
    variant_name: "",

    sku: "",

    price: "",

    stock: "",

    color: "",

    material: "",

    size: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadErrorLocal, setUploadErrorLocal] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveNewImages = async () => {
    if (selectedImages.length === 0) return;
    setIsUploading(true);
    try {
      const filesToUpload = selectedImages.map((img) => img.file);
      await dispatch(
        uploadVariantImage({
          variant: variant.id,
          images: filesToUpload,
        }),
      ).unwrap();

      // refresh product detail to get new images
      // assuming productId is available? We don't have productId in EditVariantModal props!
      // But variant has product id? Yes, variant.product. Or we can just let Redux handle it.
      // The slice updates the variant images locally in state if productDetail exists.
      setSelectedImages([]);
    } catch (err) {
      const errMsg =
        typeof err === "string"
          ? err
          : err?.error ||
            err?.detail ||
            err?.message ||
            "Failed to upload images";
      setUploadErrorLocal(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteExistingImage = async (imageId) => {
    try {
      await dispatch(deleteVariantImage(imageId)).unwrap();
    } catch (err) {
      const errMsg =
        typeof err === "string"
          ? err
          : err?.error ||
            err?.detail ||
            err?.message ||
            "Failed to delete image";
      setUploadErrorLocal(errMsg);
    }
  };

  // ==========================================
  // PREFILL
  // ==========================================

  useEffect(() => {
    if (variant) {
      setFormData({
        variant_name: variant.variant_name || "",

        sku: variant.sku || "",

        price: variant.price ?? "",

        stock: variant.stock ?? "",

        color: variant.color || "",

        material: variant.material || "",

        size: variant.size || "",
      });

      setFormErrors({});
      setUploadErrorLocal("");
      setSelectedImages([]);
    }
  }, [variant]);

  useEffect(() => {
    dispatch(clearProductMessages());
    if (isOpen) {
      setUploadErrorLocal("");
      setSelectedImages([]);
    }
  }, [dispatch, isOpen]);

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

  const mapApiErrors = (payload) => {
    if (!payload || typeof payload !== "object") {
      return {};
    }

    const next = {};

    if (typeof payload.error === "string") {
      next._general = payload.error;
    }

    for (const key of Object.keys(payload)) {
      if (key === "error") continue;

      const val = payload[key];

      if (Array.isArray(val)) {
        next[key] = val[0];
      } else if (typeof val === "string") {
        next[key] = val;
      }
    }

    return next;
  };

  const validateClient = () => {
    const next = {};

    if (!formData.variant_name.trim()) {
      next.variant_name = "Variant name is required.";
    }

    if (!formData.sku.trim()) {
      next.sku = "SKU is required.";
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price <= 0) {
      next.price = "Enter a price greater than 0.";
    }

    const stock = Number(formData.stock);

    if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
      next.stock = "Enter a whole number stock of 0 or more.";
    }

    setFormErrors(next);

    return Object.keys(next).length === 0;
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateClient()) {
      return;
    }

    const payload = {
      variant_name: formData.variant_name.trim(),

      sku: formData.sku.trim(),

      price: Number(formData.price),

      stock: Number(formData.stock),

      color: formData.color.trim(),

      material: formData.material.trim(),

      size: formData.size.trim(),
    };

    const result = await dispatch(
      updateVariant({
        variantId: variant.id,

        data: payload,
      }),
    );

    if (updateVariant.rejected.match(result)) {
      setFormErrors(mapApiErrors(result.payload));

      dispatch(clearProductMessages());

      return;
    }

    if (updateVariant.fulfilled.match(result)) {
      onClose();
    }
  };

  // ==========================================
  // CLOSE
  // ==========================================

  if (!isOpen || !variant) {
    return null;
  }

  return (
    <div className="create-product-overlay">
      <div className="create-variant-modal">
        {/* HEADER */}

        <div className="create-product-header">
          <div>
            <h2>Edit Variant</h2>

            <p>Update pricing, stock, materials, and finish details.</p>
          </div>

          <button className="close-btn" onClick={onClose}>
            <X size={26} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>
          <div className="create-product-body">
            {/* ERROR */}

            {(productError || formErrors._general) && (
              <div className="form-error">
                {typeof productError === "string"
                  ? productError
                  : productError
                    ? JSON.stringify(productError)
                    : formErrors._general}
              </div>
            )}

            {/* NAME + SKU */}

            <div className="double-fields">
              <div className="form-group">
                <label>VARIANT NAME</label>

                <input
                  type="text"
                  name="variant_name"
                  placeholder="Variant name"
                  value={formData.variant_name}
                  onChange={handleChange}
                  required
                />

                {formErrors.variant_name && (
                  <div className="form-error">{formErrors.variant_name}</div>
                )}
              </div>

              <div className="form-group">
                <label>SKU</label>

                <input
                  type="text"
                  name="sku"
                  placeholder="SKU"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />

                {formErrors.sku && (
                  <div className="form-error">{formErrors.sku}</div>
                )}
              </div>
            </div>

            {/* PRICE + STOCK */}

            <div className="double-fields">
              <div className="form-group">
                <label>PRICE</label>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="price"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />

                {formErrors.price && (
                  <div className="form-error">{formErrors.price}</div>
                )}
              </div>

              <div className="form-group">
                <label>STOCK</label>

                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />

                {formErrors.stock && (
                  <div className="form-error">{formErrors.stock}</div>
                )}
              </div>
            </div>

            {/* COLOR + MATERIAL */}

            <div className="double-fields variant-color-grid">
              <div className="form-group">
                <label>COLOR / FINISH</label>

                <div className="color-input-wrapper">
                  <input
                    type="text"
                    name="color"
                    placeholder="Color"
                    value={formData.color}
                    onChange={handleChange}
                    required={formData.is_active}
                  />

                  <div className="color-preview"></div>
                </div>

                {formErrors.color && (
                  <div className="form-error">{formErrors.color}</div>
                )}
              </div>

              <div className="form-group">
                <label>MATERIAL</label>

                <input
                  type="text"
                  name="material"
                  placeholder="Material"
                  value={formData.material}
                  onChange={handleChange}
                  required={formData.is_active}
                />

                {formErrors.material && (
                  <div className="form-error">{formErrors.material}</div>
                )}
              </div>
            </div>

            {/* SIZE */}

            <div className="form-group">
              <label>SIZE / DIMENSIONS</label>

              <input
                type="text"
                name="size"
                placeholder='28" x 32" x 34"'
                value={formData.size}
                onChange={handleChange}
                required={formData.is_active}
              />

              {formErrors.size && (
                <div className="form-error">{formErrors.size}</div>
              )}
            </div>

            {/* IMAGE UPLOAD */}
            <VariantMediaUploader
              existingImages={variant.images || []}
              onDeleteExistingImage={handleDeleteExistingImage}
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              isEditMode={true}
              onSaveNewImages={handleSaveNewImages}
              uploadLoading={productLoading || isUploading}
            />
            {uploadErrorLocal && (
              <div className="form-error" style={{ marginTop: "8px" }}>
                {uploadErrorLocal}
              </div>
            )}
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
              <Pencil size={18} />

              {productLoading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
