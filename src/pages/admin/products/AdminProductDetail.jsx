import "../../../styles/adminproductdetails.css";

import {
  toggleVariantStatus,
  clearProductMessages,
  clearProductSuccess,
  clearProductError,
  getAdminProductDetail,
} from "../../../features/catalog/product/productSlice";

import EditVariantModal
from "./EditVariantModal";

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useParams,
  Link,
} from "react-router-dom";

import {
  Pencil,
  Plus,
  Upload,
  MoreHorizontal,
  X,
} from "lucide-react";

import EditProductModal
from "./EditProductModal";

import CreateVariantModal
from "./CreateVariantModal";

export default function AdminProductDetail() {

  const dispatch = useDispatch();

  const { id } = useParams();

  // ==========================================
  // STATE
  // ==========================================

  const [
    openEditModal,
    setOpenEditModal,
  ] = useState(false);

  const [
    openVariantModal,
    setOpenVariantModal,
  ] = useState(false);

  // ==========================================
  // REDUX
  // ==========================================

  const {
    productDetail,
    productLoading,
    productSuccess,
    productError,
  } = useSelector(
    (state) => state.product
  );


  const [
  openEditVariantModal,
  setOpenEditVariantModal,
] = useState(false);

const [
  selectedVariant,
  setSelectedVariant,
] = useState(null);

const handleEditVariant = (
  variant
) => {

  setSelectedVariant(
    variant
  );

  setOpenEditVariantModal(
    true
  );
};

const handleToggleVariant =
    async (variantId) => {

      try {

        await dispatch(
          toggleVariantStatus(
            variantId
          )
        ).unwrap();

        dispatch(
          getAdminProductDetail(
            id
          )
        );

      } catch (error) {

        // Redux error already handled
      }
    };
  // ==========================================
  // FETCH PRODUCT
  // ==========================================

  useEffect(() => {

    if (id) {

      dispatch(
        getAdminProductDetail(id)
      );
    }

  }, [dispatch, id]);

  useEffect(() => {

    if (!productSuccess)
      return;

    const timer = setTimeout(() => {

      dispatch(
        clearProductSuccess()
      );
    }, 5000);

    return () =>
      clearTimeout(timer);
  }, [

    dispatch,
    productSuccess,

  ]);

  // ==========================================
  // LOADING
  // ==========================================

  if (!productDetail) {

    return (

      <div className="product-detail-loading">

        {
          productLoading

            ? "Loading..."

            : "Product not found."
        }

      </div>
    );
  }

  // ==========================================
  // DATA
  // ==========================================

  const variants =
    productDetail.variants || [];

  const totalInventory =
    variants.reduce(
      (acc, item) =>
        acc + (item.stock || 0),
      0
    );

  const productImage =

      productDetail.thumbnail ||

      variants?.[0]
        ?.images?.[0]
        ?.image_url ||

      variants?.[0]
        ?.images?.[0]
        ?.image ||

      "";

  // ==========================================
  // JSX
  // ==========================================

  return (

    <div className="admin-product-detail-page">

      {
        productSuccess && (

          <div
            className="product-detail-flash success"
            role="status"
          >

            <span>

              {
                productSuccess
              }

            </span>

            <button
              type="button"
              className="product-detail-flash-dismiss"
              onClick={() =>
                dispatch(
                  clearProductSuccess()
                )
              }
              aria-label="Dismiss"
            >

              <X size={18} />

            </button>

          </div>
        )
      }

      {
        productError && (

          <div
            className="product-detail-flash error"
            role="alert"
          >

            <span>

              {
                productError
              }

            </span>

            <button
              type="button"
              className="product-detail-flash-dismiss"
              onClick={() =>
                dispatch(
                  clearProductError()
                )
              }
              aria-label="Dismiss"
            >

              <X size={18} />

            </button>

          </div>
        )
      }

      {/* BREADCRUMBS */}

      <div className="product-breadcrumbs">

      <Link to="/admin/products">

        Products

      </Link>

      <span>
        {" / "}
      </span>

      {
        productDetail.breadcrumbs?.map(
          (item, index) => (

            <span key={item.id}>

              <Link
                to={`/admin/categories/${item.slug}`}
              >

                {item.name}

              </Link>

              {
                index !==
                productDetail.breadcrumbs.length - 1 && (
                  <span>
                    {" / "}
                  </span>
                )
              }

            </span>
          )
        )
      }

    </div>

      {/* HERO */}

      <div className="product-detail-hero">

        {/* LEFT */}

        <div className="product-detail-image">

          {
            productImage ? (

              <img
                src={productImage}
                alt={
                  productDetail.name
                }
              />

            ) : (

              <div className="no-product-image">

                No Image

              </div>
            )
          }

          <div
            className={
              productDetail.is_active

                ? "product-status active"

                : "product-status inactive"
            }
          >

            {
              productDetail.is_active

                ? "ACTIVE STATUS"

                : "INACTIVE STATUS"
            }

          </div>

        </div>

        {/* RIGHT */}

        <div className="product-detail-content">

          {/* TAGS */}

          <div className="product-detail-tags">

           {/* {
              productDetail.category_name && (

                <span>

                  {
                    productDetail.category_name
                  }

                </span>
              )
            } */}

                    {
                productDetail.room_types?.map(
                  (room) => (

                    <span key={room.id}>

                      {room.name}

                    </span>
                  )
                )
                
              }

          </div>

          {/* TITLE */}

          <h1>

            {
              productDetail.name
            }

          </h1>

          {/* DESCRIPTION */}

          <p className="product-description">

            {
              productDetail.description ||
              "No description added."
            }

          </p>

          {/* META */}

         <div className="product-meta-grid">

              <div>

                <small>
                  CREATED
                </small>

                <strong>

                  {
                    productDetail.created_at

                      ? new Date(
                          productDetail.created_at
                        ).toLocaleDateString(
                          "en-US",
                          {

                            month:
                              "short",

                            day:
                              "2-digit",

                            year:
                              "numeric",
                          }
                        )

                      : "-"
                  }

                </strong>

              </div>

              <div>

                <small>
                  INVENTORY
                </small>

                <strong>

                  {
                    totalInventory
                  } Total Units

                </strong>

              </div>

              <div>

                <small>
                  CATEGORY
                </small>

                <strong>

                  {
                    productDetail.category_name ||
                    "-"
                  }

                </strong>

              </div>

            </div>

          {/* ACTIONS */}

          <div className="product-detail-actions">

            <button
              className="edit-product-btn"
              onClick={() =>
                setOpenEditModal(true)
              }
            >

              <Pencil size={18} />

              Edit Product

            </button>

            <button className="more-btn">

              <MoreHorizontal
                size={20}
              />

            </button>

          </div>

        </div>

      </div>

      {/* VARIANTS */}

      <div className="variants-section">

        <div className="variants-header">

          <div>

            <h2>
              Variants
            </h2>

            <p>
              Manage material finishes,
              colors, and stock levels.
            </p>

          </div>

          <button
            className="add-variant-btn"
            onClick={() =>
              setOpenVariantModal(true)
            }
          >

            <Plus size={18} />

            Add Variant

          </button>

        </div>

        {/* GRID */}

        {
          variants.length > 0 ? (

            <div className="variants-grid">

              {
                variants.map(
                  (variant) => {

                    return (

                      <div
                        key={variant.id}
                        className="variant-card"
                      >

                        {/* IMAGES */}

                        <div className="variant-images">

                          {
                            variant.images
                              ?.slice(0, 3)
                              ?.map(
                                (image) => (

                                  <img
                                    key={
                                      image.id
                                    }
                                    src={
                                      image.image
                                    }
                                    alt=""
                                  />
                                )
                              )
                          }

                        </div>

                        {/* CONTENT */}

                        <div className="variant-content">

                          <div className="variant-top">

                            <div>

                              <h3>

                                {
                                  variant.variant_name
                                }

                              </h3>

                              <small>

                                SKU:
                                {" "}

                                {
                                  variant.sku ||
                                  "-"
                                }

                              </small>

                            </div>

                            <span
                              className={
                                variant.is_active

                                  ? "variant-status active"

                                  : "variant-status inactive"
                              }
                            >

                              {
                                variant.is_active

                                  ? "ACTIVE"

                                  : "INACTIVE"
                              }

                            </span>

                          </div>

                          {/* META */}

                          <div className="variant-meta">

                            <div>

                              <span
                                className="color-dot"
                              ></span>

                              {
                                variant.color ||
                                "Color"
                              }

                            </div>

                            <div>

                              {
                                variant.material ||
                                "Material"
                              }

                            </div>

                          </div>

                          {/* PRICE */}

                          <div className="variant-price-stock">

                            <strong>

                              ₹
                              {
                                variant.price ||
                                0
                              }

                            </strong>

                            <span>

                              {
                                variant.stock ||
                                0
                              } in stock

                            </span>

                          </div>

                          {/* BUTTONS */}

                          <div className="variant-actions">

                           <button
                            onClick={() =>
                                handleEditVariant(
                                variant
                                )
                            }
                            >

                            Edit Variant

                            </button>

                            <button
                                onClick={() =>
                                    handleToggleVariant(
                                    variant.id
                                    )
                                }
                                >

                                {
                                    variant.is_active

                                    ? "Deactivate"

                                    : "Activate"
                                }

                                </button>

                          </div>

                          <Link
                            to={`/admin/products/${productDetail.id}/variants/${variant.id}/media`}
                            className="upload-images-btn"
                            >

                            <Upload size={16} />

                            Upload Images

                            </Link>

                        </div>

                      </div>
                    );
                  }
                )
              }

            </div>

          ) : (

            <div className="empty-variants">

              No variants added yet

            </div>

          )
        }

      </div>

      {/* EDIT PRODUCT MODAL */}

      <EditProductModal

        isOpen={
          openEditModal
        }

        onClose={() =>
          setOpenEditModal(false)
        }

        product={
          productDetail
        }

      />

      {/* CREATE VARIANT MODAL */}

      <CreateVariantModal

        isOpen={
          openVariantModal
        }

        onClose={() =>
          setOpenVariantModal(false)
        }

        productId={
          productDetail.id
        }

      />

      <EditVariantModal

        isOpen={
            openEditVariantModal
        }

        onClose={() =>
            setOpenEditVariantModal(false)
        }

        variant={
            selectedVariant
        }

        />

    </div>
  );
}