import "../../../styles/createproductmodal.css";

import CreateCategoryModal
from "../categories/CreateCategoryModal";

import CreateRoomTypeModal
from "../roomType/CreateRoomTypeModal";

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
  createProduct,
} from "../../../features/catalog/product/productSlice";

import {
  getAdminCategories,
} from "../../../features/catalog/category/categorySlice";

import {
  getAdminRoomTypes,
} from "../../../features/catalog/roomType/roomTypeSlice";

export default function CreateProductModal({

  isOpen,
  onClose,
  onSuccess,

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

    room_type_ids: [],

    is_featured: false,

    is_active: true,
  });

  const [
    showCreateCategoryModal,
    setShowCreateCategoryModal,
  ] = useState(false);

  const [
    showCreateRoomTypeModal,
    setShowCreateRoomTypeModal,
  ] = useState(false);

  // ==========================================
  // FETCH ACTIVE DATA
  // ==========================================

  useEffect(() => {

    if (!isOpen)
      return;

    dispatch(
      getAdminCategories({

        page: 1,

        page_size: 1000,

        is_active: true,
      })
    );

    dispatch(
      getAdminRoomTypes({

        page: 1,

        page_size: 1000,

        is_active: true,
      })
    );

  }, [

    dispatch,
    isOpen,

  ]);

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
  // HANDLE ROOM TYPE
  // ==========================================

  const handleRoomTypeToggle =
    (roomTypeId, checked) => {

      if (checked) {

        setFormData((prev) => ({

          ...prev,

          room_type_ids: [

            ...new Set([

              ...prev.room_type_ids,

              roomTypeId,
            ]),
          ],
        }));

      } else {

        setFormData((prev) => ({

          ...prev,

          room_type_ids:

            prev.room_type_ids.filter(
              (id) =>
                id !== roomTypeId
            ),
        }));
      }
    };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {

    setFormData({

      name: "",

      description: "",

      category: "",

      room_type_ids: [],

      is_featured: false,

      is_active: true,
    });
  };

  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const handleClose = () => {

    resetForm();

    onClose();
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const result =
        await dispatch(
          createProduct(formData)
        );

      if (
        createProduct.fulfilled.match(
          result
        )
      ) {

        // refresh products
        if (onSuccess) {

          onSuccess();
        }

        // reset form
        resetForm();

        // close modal
        onClose();
      }
    };

  // ==========================================
  // CLOSE
  // ==========================================

  if (!isOpen)
    return null;

  return (

    <div className="create-product-overlay">

      <div className="create-product-modal">

        {/* HEADER */}

        <div className="create-product-header">

          <div>

            <h2>
              New Product
            </h2>

            <p>
              Add a new piece to your digital craftsmanship collection.
            </p>

          </div>

          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
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
                placeholder="e.g. Walnut Hand-Carved Lounge Chair"
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

                <div className="field-label-row">

                  <label>
                    CATEGORY
                  </label>

                  <button
                    type="button"
                    className="inline-create-link"
                    onClick={() =>
                      setShowCreateCategoryModal(true)
                    }
                  >

                    + Create Category

                  </button>

                </div>

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

              {/* ROOM TYPES */}

              <div className="form-group">

                <div className="field-label-row">

                  <label>
                    ROOM TYPES
                  </label>

                  <button
                    type="button"
                    className="inline-create-link"
                    onClick={() =>
                      setShowCreateRoomTypeModal(true)
                    }
                  >

                    + Create Room Type

                  </button>

                </div>

                <div className="multi-room-grid">

                  {
                    roomTypes
                      ?.filter(
                        (item) =>
                          item.is_active
                      )
                      ?.map(
                        (item) => (

                          <label
                            key={item.id}
                            className={`room-type-chip ${
                              formData.room_type_ids.includes(
                                item.id
                              )
                                ? "active"
                                : ""
                            }`}
                          >

                            <input
                              type="checkbox"
                              checked={
                                formData.room_type_ids.includes(
                                  item.id
                                )
                              }
                              onChange={(e) =>

                                handleRoomTypeToggle(

                                  item.id,

                                  e.target.checked
                                )
                              }
                            />

                            <span>
                              {item.name}
                            </span>

                          </label>
                        )
                      )
                  }

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
                placeholder="Describe the materials, craftsmanship process, and unique design features..."
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
                    Show on the homepage gallery
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
                    Visible to customers in catalog
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

                Product imagery can be added later
                while creating variants.

              </p>

            </div>

          </div>

          {/* FOOTER */}

          <div className="create-product-footer">

            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
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

                  ? "Creating..."

                  : "Create Product"
              }

            </button>

          </div>

        </form>

      </div>

      {/* CREATE CATEGORY MODAL */}

      <CreateCategoryModal

        isOpen={showCreateCategoryModal}

        onClose={() =>
          setShowCreateCategoryModal(false)
        }
      />

      {/* CREATE ROOM TYPE MODAL */}

      <CreateRoomTypeModal

        isOpen={showCreateRoomTypeModal}

        onClose={() =>
          setShowCreateRoomTypeModal(false)
        }
      />

    </div>
  );
}