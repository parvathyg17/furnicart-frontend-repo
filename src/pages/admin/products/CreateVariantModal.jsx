import "../../../styles/createvariantmodal.css";
import "../../../styles/adminvariantmedialibrary.css"; // Added to reuse upload styles

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  X,
  Plus,
  ImagePlus,
  Upload,
  Trash2,
} from "lucide-react";

import {
  createVariant,
  clearProductMessages,
  uploadVariantImage,
} from "../../../features/catalog/product/productSlice";

import VariantMediaUploader from "../../../components/admin/products/VariantMediaUploader";

export default function CreateVariantModal({

  isOpen,
  onClose,
  productId,

}) {

  const dispatch = useDispatch();

  const {
    productLoading,
    productError,
  } = useSelector(
    (state) => state.product
  );

  // ==========================================
  // FORM
  // ==========================================

  const [
    formData,
    setFormData,
  ] = useState({

    variant_name: "",

    sku: "",

    price: "",

    stock: "",

    color: "",

    material: "",

    size: "",

    is_active: false,
  });

  const submittingRef =
    useRef(false);

  const [
    formErrors,
    setFormErrors,
  ] = useState({});

  useEffect(() => {
    dispatch(clearProductMessages());
    setFormErrors({});
    setSelectedImages([]);
    
    if (isOpen) {
      setFormData({
        variant_name: "",
        sku: "",
        price: "",
        stock: "",
        color: "",
        material: "",
        size: "",
        is_active: false,
      });
    }
  }, [dispatch, isOpen]);

  // ==========================================
  // IMAGE UPLOAD STATE
  // ==========================================
  const [selectedImages, setSelectedImages] = useState([]);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]:

        type === "checkbox"

          ? checked

          : value,
    }));

    setFormErrors((prev) => ({

      ...prev,

      [name]: "",
    }));
  };

  const mapApiErrors =
    (payload) => {

      if (
        !payload ||
        typeof payload !== "object"
      ) {

        return {};
      }

      const next = {};

      if (
        typeof payload.error === "string"
      ) {

        next._general =
          payload.error;
      }

      for (const key of Object.keys(payload)) {

        if (key === "error")
          continue;

        const val =
          payload[key];

        if (Array.isArray(val)) {

          next[key] =
            val[0];
        } else if (

          typeof val === "string"
        ) {

          next[key] = val;
        }
      }

      return next;
    };

  const validateClient =
    () => {

      const next = {};

      if (!formData.variant_name.trim()) {

        next.variant_name =
          "Variant name is required.";
      }

      if (!formData.sku.trim()) {

        next.sku =
          "SKU is required.";
      }

      const price =
        Number(
          formData.price
        );

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {

        next.price =
          "Enter a price greater than 0.";
      }

      const stock =
        Number(
          formData.stock
        );

      if (
        !Number.isFinite(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
      ) {

        next.stock =
          "Enter a whole number stock of 0 or more.";
      }

      if (formData.is_active) {

        if (!formData.color.trim()) {

          next.color =
            "Color / finish is required for an active variant.";
        }

        if (!formData.material.trim()) {

          next.material =
            "Material is required for an active variant.";
        }

        if (!formData.size.trim()) {

          next.size =
            "Size / dimensions are required for an active variant.";
        }
      }

      setFormErrors(next);

      return Object.keys(next).length === 0;
    };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      if (
        submittingRef.current ||
        productLoading
      ) {

        return;
      }

      if (!validateClient()) {

        return;
      }

      submittingRef.current = true;

      try {

        const payload = {

          variant_name:
            formData.variant_name.trim(),

          sku:
            formData.sku.trim(),

          price:
            Number(
              formData.price
            ),

          stock:
            Number(
              formData.stock
            ),

          color:
            formData.color.trim(),

          material:
            formData.material.trim(),

          size:
            formData.size.trim(),

          is_active:
            formData.is_active,
        };

        const result =
          await dispatch(

            createVariant({

              productId,

              data: payload,
            })
          );

        if (
          createVariant.rejected.match(
            result
          )
        ) {

          setFormErrors(
            mapApiErrors(
              result.payload
            )
          );

          dispatch(
            clearProductMessages()
          );

          return;
        }

        if (
          createVariant.fulfilled.match(
            result
          )
        ) {
          const newVariant = result.payload;

          if (selectedImages.length > 0) {
            const filesToUpload = selectedImages.map((img) => img.file);
            await dispatch(
              uploadVariantImage({
                variant: newVariant.id,
                images: filesToUpload,
              })
            );
          }

          onClose();

          setFormData({

            variant_name: "",

            sku: "",

            price: "",

            stock: "",

            color: "",

            material: "",

            size: "",

            is_active: false,
          });

          setFormErrors({});
          setSelectedImages([]);
          setUploadError("");
        }
      } finally {

        submittingRef.current = false;
      }
    };

  // ==========================================
  // CLOSE
  // ==========================================

  if (!isOpen)
    return null;

  return (

    <div className="create-product-overlay">

      <div className="create-variant-modal">

        {/* HEADER */}

        <div className="create-product-header">

          <div>

            <h2>
              New Variant
            </h2>

            <p>
              Configure a unique material
              or finish combination for this product.
            </p>

          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >

            <X size={26} />

          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
        >

          <div className="create-product-body">

            {/* ERROR */}

            {
              (productError || formErrors._general) && (

                <div className="form-error">

                  {
                    typeof productError === "string"

                      ? productError

                      : productError

                        ? JSON.stringify(
                            productError
                          )

                        : formErrors._general
                  }

                </div>
              )
            }

            {/* NAME + SKU */}

            <div className="double-fields">

              <div className="form-group">

                <label>
                  VARIANT NAME
                </label>

                <input
                  type="text"
                  name="variant_name"
                  placeholder="e.g. Natural Oak / Sand Linen"
                  value={
                    formData.variant_name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

                {
                  formErrors.variant_name && (

                    <div className="form-error">

                      {
                        formErrors.variant_name
                      }

                    </div>
                  )
                }

              </div>

              <div className="form-group">

                <label>
                  SKU
                </label>

                <input
                  type="text"
                  name="sku"
                  placeholder="HER-OAK-02"
                  value={
                    formData.sku
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

                {
                  formErrors.sku && (

                    <div className="form-error">

                      {
                        formErrors.sku
                      }

                    </div>
                  )
                }

              </div>

            </div>

            {/* PRICE + STOCK */}

            <div className="double-fields">

              <div className="form-group">

                <label>
                  PRICE
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  name="price"
                  placeholder="0.00"
                  value={
                    formData.price
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

                {
                  formErrors.price && (

                    <div className="form-error">

                      {
                        formErrors.price
                      }

                    </div>
                  )
                }

              </div>

              <div className="form-group">

                <label>
                  STOCK QUANTITY
                </label>

                <input
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

                {
                  formErrors.stock && (

                    <div className="form-error">

                      {
                        formErrors.stock
                      }

                    </div>
                  )
                }

              </div>

            </div>

            {/* COLOR + MATERIAL */}

            <div className="double-fields variant-color-grid">

              <div className="form-group">

                <label>
                  COLOR / FINISH
                </label>

                <div className="color-input-wrapper">

                  <input
                    type="text"
                    name="color"
                    placeholder="Ebony Polish"
                    value={
                      formData.color
                    }
                    onChange={
                      handleChange
                    }
                    required={
                      formData.is_active
                    }
                  />

                  <div
                    className="color-preview"
                  ></div>

                </div>

                {
                  formErrors.color && (

                    <div className="form-error">

                      {
                        formErrors.color
                      }

                    </div>
                  )
                }

              </div>

              <div className="form-group">

                <label>
                  MATERIAL
                </label>

                <input
                  type="text"
                  name="material"
                  placeholder="Solid Ash Wood"
                  value={
                    formData.material
                  }
                  onChange={
                    handleChange
                  }
                  required={
                    formData.is_active
                  }
                />

                {
                  formErrors.material && (

                    <div className="form-error">

                      {
                        formErrors.material
                      }

                    </div>
                  )
                }

              </div>

            </div>

            {/* SIZE */}

            <div className="form-group">

              <label>
                SIZE / DIMENSIONS
              </label>

              <input
                type="text"
                name="size"
                placeholder='28" x 32" x 34"'
                value={
                  formData.size
                }
                onChange={
                  handleChange
                }
                required={
                  formData.is_active
                }
              />

              {
                formErrors.size && (

                  <div className="form-error">

                    {
                      formErrors.size
                    }

                  </div>
                )
              }

            </div>

            {/* IMAGE UPLOAD */}
            <VariantMediaUploader
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              isEditMode={false}
            />

          </div>

          {/* FOOTER */}

          <div className="create-product-footer">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >

              Cancel

            </button>

            <button
              type="submit"
              className="submit-btn"
              disabled={
                productLoading
              }
            >

              <Plus size={18} />

              {
                productLoading

                  ? "Creating..."

                  : "Create Variant"
              }

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}