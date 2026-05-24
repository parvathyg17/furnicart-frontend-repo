import "../../../styles/createproductmodal.css";

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
  ChevronDown,
} from "lucide-react";

import {
  updateProduct,
} from "../../../features/catalog/product/productSlice";

import {
  getAdminCategories,
} from "../../../features/catalog/category/categorySlice";

import {
  getAdminRoomTypes,
} from "../../../features/catalog/roomType/roomTypeSlice";

export default function EditProductModal({

  isOpen,
  onClose,
  product,

}) {

  const dispatch = useDispatch();

  const {
    productLoading,
  } = useSelector(
    (state) => state.product
  );

  const {
    categories,
  } = useSelector(
    (state) => state.category
  );

  const {
    roomTypes,
  } = useSelector(
    (state) => state.roomType
  );

  const [
    formData,
    setFormData,
  ] = useState({

    name: "",

    description: "",

    category: "",

    room_type: "",

    is_featured: false,

    is_active: true,
  });

  // ==========================================
  // FETCH DATA
  // ==========================================

  useEffect(() => {

    dispatch(
      getAdminCategories()
    );

    dispatch(
      getAdminRoomTypes()
    );

  }, [dispatch]);

  // ==========================================
  // PREFILL FORM
  // ==========================================

  useEffect(() => {

    if (product) {

      setFormData({

        name:
          product.name || "",

        description:
          product.description || "",

        category:
          product.category?.id || "",

        room_type:
          product.room_type?.id || "",

        is_featured:
          product.is_featured || false,

        is_active:
          product.is_active ?? true,
      });
    }

  }, [product]);

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

      const result =
        await dispatch(

          updateProduct({

            productId:
              product.id,

            data: formData,
          })
        );

      if (
        updateProduct.fulfilled.match(
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
    !product
  ) {

    return null;
  }

  return (

    <div className="create-product-overlay">

      <div className="create-product-modal">

        {/* HEADER */}

        <div className="create-product-header">

          <div>

            <h2>
              Edit Product
            </h2>

            <p>
              Refine and update your furniture collection details.
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

            {/* PRODUCT NAME */}

            <div className="form-group">

              <label>
                PRODUCT NAME
              </label>

              <input
                type="text"
                name="name"
                placeholder="Product name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                required
              />

            </div>

            {/* CATEGORY + ROOM TYPE */}

            <div className="double-fields">

              {/* CATEGORY */}

              <div className="form-group">

                <label>
                  CATEGORY
                </label>

                <div className="select-wrapper">

                  <select
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select category
                    </option>

                    {
                      categories
                        ?.filter(
                          (item) =>
                            item.is_active
                        )
                        ?.map(
                          (item) => (

                            <option
                              key={item.id}
                              value={item.id}
                            >

                              {item.name}

                            </option>
                          )
                        )
                    }

                  </select>

                  <ChevronDown
                    size={18}
                  />

                </div>

              </div>

              {/* ROOM TYPE */}

              <div className="form-group">

                <label>
                  ROOM TYPE
                </label>

                <div className="select-wrapper">

                  <select
                    name="room_type"
                    value={
                      formData.room_type
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select room type
                    </option>

                    {
                      roomTypes
                        ?.filter(
                          (item) =>
                            item.is_active
                        )
                        ?.map(
                          (item) => (

                            <option
                              key={item.id}
                              value={item.id}
                            >

                              {item.name}

                            </option>
                          )
                        )
                    }

                  </select>

                  <ChevronDown
                    size={18}
                  />

                </div>

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="form-group">

              <label>
                DESCRIPTION
              </label>

              <textarea
                name="description"
                placeholder="Product description..."
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* TOGGLES */}

            <div className="toggle-section">

              {/* FEATURED */}

              <div className="toggle-card">

                <div>

                  <h4>
                    Featured Product
                  </h4>

                  <p>
                    Highlight on storefront
                  </p>

                </div>

                <label className="switch">

                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={
                      formData.is_featured
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <span className="slider"></span>

                </label>

              </div>

              {/* ACTIVE */}

              <div className="toggle-card">

                <div>

                  <h4>
                    Active Status
                  </h4>

                  <p>
                    Product visibility status
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

            {/* NOTE */}

            <div className="variant-note">

              <p>

                Variant pricing, stock,
                and product imagery can
                be managed separately
                within variants.

              </p>

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