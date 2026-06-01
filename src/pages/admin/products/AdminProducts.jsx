import "../../../styles/adminproducts.css";

import toast from "react-hot-toast";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import CreateProductModal
from "./CreateProductModal";

import {
  Link,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  getAdminProducts,
  deleteProduct,
  clearProductMessages,
} from "../../../features/catalog/product/productSlice";

import {
  getAdminCategories,
} from "../../../features/catalog/category/categorySlice";

import {
  getAdminRoomTypes,
} from "../../../features/catalog/roomType/roomTypeSlice";

export default function AdminProducts() {

  const dispatch = useDispatch();

  // ==========================================
  // PRODUCT STATE
  // ==========================================

  const {

    products,
    productPagination,
    productLoading,
    productSuccess,
    productError,

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
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    roomType,
    setRoomType,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("active");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    sort,
    setSort,
  ] = useState("latest");

  const [
    openCreateModal,
    setOpenCreateModal,
  ] = useState(false);


  const [
    deleteModalOpen,
    setDeleteModalOpen,
  ] = useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);



  useEffect(() => {

    dispatch(
      getAdminCategories({

        is_active: true,
      })
    );

    dispatch(
      getAdminRoomTypes({

        is_active: true,
      })
    );

  }, [dispatch]);



  useEffect(() => {

    dispatch(
      getAdminProducts({

        page: currentPage,

        search,

        sort,

        category,

        room_type: roomType,

        is_active:

          status === "all"

            ? ""

            : status === "active"

              ? "true"

              : "false",
      })
    );

  }, [

    dispatch,
    currentPage,
    search,
    category,
    roomType,
    sort,
    status,

  ]);

 

  const openDeleteModal = (
    product
  ) => {

    setSelectedProduct(
      product
    );

    setDeleteModalOpen(
      true
    );
  };

  const handleDeleteProduct =
    async () => {

      if (!selectedProduct)
        return;

      try {

        await dispatch(
          deleteProduct(
            selectedProduct.id
          )
        ).unwrap();

        setDeleteModalOpen(
          false
        );

        setSelectedProduct(
          null
        );

        const updatedCount =
          (productPagination?.count || 1) - 1;

        const updatedPages =
          Math.ceil(
            updatedCount / 10
          );

        if (
          currentPage > updatedPages &&
          currentPage > 1
        ) {

          setCurrentPage(
            currentPage - 1
          );

        } else {

          dispatch(
            getAdminProducts({

              page: currentPage,

              search,

              category,

              room_type: roomType,

              sort,

              is_active:

                status === "all"

                  ? ""

                  : status === "active"

                    ? "true"

                    : "false",
            })
          );
        }

      } catch (error) {

        /* deleteProduct.rejected sets productError; toast via useEffect */
      }
    };

  

  const totalPages =
    productPagination?.totalPages ?? 0;

  const pages = useMemo(() => {

    return Array.from(

      { length: totalPages },

      (_, index) =>
        index + 1
    );

  }, [totalPages]);

  useEffect(() => {

    if (!productSuccess)
      return;

    toast.success(
      productSuccess
    );

    const timer =
      setTimeout(() => {

        dispatch(
          clearProductMessages()
        );
      }, 3000);

    return () =>
      clearTimeout(timer);
  }, [

    dispatch,
    productSuccess,

  ]);

  useEffect(() => {

    if (!productError)
      return;

    toast.error(

      typeof productError === "string"

        ? productError

        : JSON.stringify(
            productError
          )
    );

    const timer =
      setTimeout(() => {

        dispatch(
          clearProductMessages()
        );
      }, 3000);

    return () =>
      clearTimeout(timer);
  }, [

    dispatch,
    productError,

  ]);

  return (

    <div className="admin-products-page">

     

      <div className="products-header">

        <div>

          <h1>
            Products
          </h1>

          <p>

            Catalog /

            <span>
              {" "}All Products
            </span>

          </p>

        </div>

        <button
          className="new-product-btn"
          onClick={() =>
            setOpenCreateModal(true)
          }
        >

          <Plus size={18} />

          New Product

        </button>

      </div>

 

      <div className="products-filters">

        {/* SEARCH */}

        <div className="search-box">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {

              setSearch(
                e.target.value
              );

              setCurrentPage(1);
            }}
          />

        </div>

        {/* CATEGORY */}

        <select
          value={category}
          onChange={(e) => {

            setCategory(
              e.target.value
            );

            setCurrentPage(1);
          }}
        >

          <option value="">
            Category
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
                    value={item.slug}
                  >

                    {item.name}

                  </option>
                )
              )
          }

        </select>

        {/* ROOM TYPE */}

        <select
          value={roomType}
          onChange={(e) => {

            setRoomType(
              e.target.value
            );

            setCurrentPage(1);
          }}
        >

          <option value="">
            Room Type
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
                    value={item.slug}
                  >

                    {item.name}

                  </option>
                )
              )
          }

        </select>

       

        <div className="status-tabs">

          

          <select
            value={sort}
            onChange={(e) => {

              setSort(
                e.target.value
              );

              setCurrentPage(1);
            }}
          >

            <option value="latest">
              Latest
            </option>

            <option value="oldest">
              Oldest
            </option>

            <option value="a_z">
              A-Z
            </option>

            <option value="z_a">
              Z-A
            </option>

            <option value="price_low">
              Price Low to High
            </option>

            <option value="price_high">
              Price High to Low
            </option>

          </select>

          <button
            type="button"
            className={
              status === "all"

                ? "active"

                : ""
            }
            onClick={() => {

              setStatus("all");

              setCurrentPage(1);
            }}
          >
            All
          </button>

          <button
            type="button"
            className={
              status === "active"

                ? "active"

                : ""
            }
            onClick={() => {

              setStatus("active");

              setCurrentPage(1);
            }}
          >
            Active
          </button>

          <button
            type="button"
            className={
              status === "inactive"

                ? "active"

                : ""
            }
            onClick={() => {

              setStatus("inactive");

              setCurrentPage(1);
            }}
          >
            Inactive
          </button>

        </div>

      </div>


      {
        productLoading ? (

          <div className="empty-products">

            Loading products...

          </div>

        ) : products?.length > 0 ? (

          <div className="products-grid">

            {
              products.map(
                (product) => {

                  const variants =
                    product.variants || [];

                  const thumbnail =

                    product.thumbnail ||

                    product.image ||

                    variants?.[0]
                      ?.images?.[0]
                      ?.image ||

                    "";

                  return (

                    <div
                      key={product.id}
                      className="product-card"
                    >

                      

                      <div className="product-image-wrapper">

                        {
                          thumbnail ? (

                            <img
                              src={thumbnail}
                              alt={
                                product.name
                              }
                              className="product-image"
                            />

                          ) : (

                            <div className="no-image">

                              No Image

                            </div>
                          )
                        }

                        <div
                          className={
                            product.is_active

                              ? "status-badge active"

                              : "status-badge inactive"
                          }
                        >

                          {
                            product.is_active

                              ? "ACTIVE"

                              : "INACTIVE"
                          }

                        </div>

                      </div>

                      

                      <div className="product-content">

                        <h3>

                          {
                            product.name
                          }

                        </h3>

                        <div className="product-tags">

                          {
                            product.category_name && (

                              <span>

                                {
                                  product.category_name
                                }

                              </span>
                            )
                          }

                          {
                            product.room_types?.map(
                              (room) => (

                                <span key={room.id}>

                                  {room.name}

                                </span>
                              )
                            )
                          }

                        </div>

                        <div className="product-meta">

                          <div>

                            <small>
                              VARIANTS
                            </small>

                            <strong>

                              {
                                variants.length
                              } Options

                            </strong>

                          </div>

                          <div>

                            <small>
                              CREATED
                            </small>

                            <strong>

                              {
                                product.created_at

                                  ? new Date(
                                      product.created_at
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

                        </div>

                        {/* ACTIONS */}

                        <div className="product-actions">

                          <Link
                            to={`/admin/products/${product.id}`}
                            className="product-action-link"
                          >

                            <Eye size={18} />

                          </Link>

                          <Link
                            to={`/admin/products/${product.id}`}
                            className="product-action-link"
                          >

                            <Pencil size={18} />

                          </Link>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              openDeleteModal(
                                product
                              )
                            }
                          >
                            <Trash2 size={18} />
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                }
              )
            }

          </div>

        ) : (

          <div className="empty-products">

            No products found

          </div>

        )
      }

      

      {
        products?.length > 0 && (

          <div className="products-footer">

            <p>

              Showing{" "}

              {
                products.length
              }

              {" "}of{" "}

              {
                productPagination?.count || 0
              }

              {" "}products

            </p>

            <div className="pagination">

              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.max(
                        prev - 1,
                        1
                      )
                  )
                }
              >

                <ChevronLeft size={18} />

              </button>

              {
                pages.map(
                  (page) => (

                    <button
                      type="button"
                      key={page}
                      className={
                        currentPage === page

                          ? "active"

                          : ""
                      }
                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >

                      {page}

                    </button>
                  )
                )
              }

              <button
                type="button"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.min(
                        prev + 1,
                        totalPages
                      )
                  )
                }
              >

                <ChevronRight size={18} />

              </button>

            </div>

          </div>
        )
      }

      

      {
        deleteModalOpen && (

          <div
            className="modal-overlay"
            onClick={() => {

              setDeleteModalOpen(
                false
              );

              setSelectedProduct(
                null
              );
            }}
          >

            <div
              className="delete-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <h3>

                Delete Product

              </h3>

              <p>

                Are you sure you want to delete

                <strong>

                  {" "}
                  {selectedProduct?.name}

                </strong>

                ?

                <br />

                <br />

                This action cannot be undone.

              </p>

              <div className="delete-modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {

                    setDeleteModalOpen(
                      false
                    );

                    setSelectedProduct(
                      null
                    );
                  }}
                >

                  Cancel

                </button>

                <button
                  type="button"
                  className="confirm-delete-btn"
                  onClick={
                    handleDeleteProduct
                  }
                >

                  Delete

                </button>

              </div>

            </div>

          </div>
        )
      }

      <CreateProductModal

        isOpen={
          openCreateModal
        }

        onClose={() =>
          setOpenCreateModal(false)
        }

        onSuccess={() => {

          dispatch(
            getAdminProducts({

              page: currentPage,

              search,

              sort,

              category,

              room_type: roomType,

              is_active:

                status === "all"

                  ? ""

                  : status === "active"

                    ? "true"

                    : "false",
            })
          );
        }}

      />

    </div>
  );
}