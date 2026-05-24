import "../../../styles/createvariantmodal.css";

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
  Pencil,
} from "lucide-react";

import {
  updateVariant,
} from "../../../features/catalog/product/productSlice";

export default function EditVariantModal({

  isOpen,
  onClose,
  variant,

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

    is_active: true,
  });

  // ==========================================
  // PREFILL
  // ==========================================

  useEffect(() => {

    if (variant) {

      setFormData({

        variant_name:
          variant.variant_name || "",

        sku:
          variant.sku || "",

        price:
          variant.price || "",

        stock:
          variant.stock || "",

        color:
          variant.color || "",

        material:
          variant.material || "",

        size:
          variant.size || "",

        is_active:
          variant.is_active ?? true,
      });
    }

  }, [variant]);

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
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const payload = {

        variant_name:
          formData.variant_name,

        sku:
          formData.sku,

        price:
          Number(
            formData.price
          ),

        stock:
          Number(
            formData.stock
          ),

        color:
          formData.color,

        material:
          formData.material,

        size:
          formData.size,

        is_active:
          formData.is_active,
      };

      const result =
        await dispatch(

          updateVariant({

            variantId:
              variant.id,

            data: payload,
          })
        );

      if (
        updateVariant.fulfilled.match(
          result
        )
      ) {

        onClose();
      }
    };

  // ==========================================
  // CLOSE
  // ==========================================

  if (
    !isOpen ||
    !variant
  ) {

    return null;
  }

  return (

    <div className="create-product-overlay">

      <div className="create-variant-modal">

        {/* HEADER */}

        <div className="create-product-header">

          <div>

            <h2>
              Edit Variant
            </h2>

            <p>
              Update pricing, stock,
              materials, and finish details.
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
              productError && (

                <div className="form-error">

                  {
                    typeof productError === "string"

                      ? productError

                      : JSON.stringify(
                          productError
                        )
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
                  placeholder="Variant name"
                  value={
                    formData.variant_name
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  SKU
                </label>

                <input
                  type="text"
                  name="sku"
                  placeholder="SKU"
                  value={
                    formData.sku
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

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

              </div>

              <div className="form-group">

                <label>
                  STOCK
                </label>

                <input
                  type="number"
                  name="stock"
                  placeholder="0"
                  value={
                    formData.stock
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

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
                    placeholder="Color"
                    value={
                      formData.color
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <div
                    className="color-preview"
                  ></div>

                </div>

              </div>

              <div className="form-group">

                <label>
                  MATERIAL
                </label>

                <input
                  type="text"
                  name="material"
                  placeholder="Material"
                  value={
                    formData.material
                  }
                  onChange={
                    handleChange
                  }
                />

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
              />

            </div>

            {/* STATUS */}

            <div className="variant-status-card">

              <div>

                <h4>
                  Active Status
                </h4>

                <p>
                  Control storefront visibility
                  for this variant.
                </p>

              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    formData.is_active
                  }
                  onChange={
                    handleChange
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

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

              <Pencil size={18} />

              {
                productLoading

                  ? "Updating..."

                  : "Save Changes"
              }

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}