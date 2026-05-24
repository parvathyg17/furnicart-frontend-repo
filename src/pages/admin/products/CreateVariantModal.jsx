import "../../../styles/createvariantmodal.css";

import {
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  X,
  Plus,
} from "lucide-react";

import {
  createVariant,
} from "../../../features/catalog/product/productSlice";

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

    is_active: true,
  });

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

          createVariant({

            productId,

            data: payload,
          })
        );

      if (
        createVariant.fulfilled.match(
          result
        )
      ) {

        onClose();

        setFormData({

          variant_name: "",

          sku: "",

          price: "",

          stock: "",

          color: "",

          material: "",

          size: "",

          is_active: true,
        });
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
                  placeholder="e.g. Natural Oak / Sand Linen"
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
                  placeholder="HER-OAK-02"
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
                  STOCK QUANTITY
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
                    placeholder="Ebony Polish"
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
                  placeholder="Solid Ash Wood"
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
                  Make this variant visible
                  to customers immediately.
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