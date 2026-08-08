import "../../../styles/adminproducts.css";

import toast from "react-hot-toast";
import { useCallback, useEffect, useMemo, useState } from "react";

import CreateProductModal from "./CreateProductModal";

import { Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";

import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
} from "lucide-react";

import {
  getAdminProducts,
  deleteProduct,
  clearProductMessages,
  updateProduct,
  toggleProductStatus,
} from "../../../features/catalog/product/productSlice";

import { getAdminCategories } from "../../../features/catalog/category/categorySlice";

import { getAdminRoomTypes } from "../../../features/catalog/roomtype/roomTypeSlice";

import { useBackgroundServerSync } from "../../../hooks/useBackgroundServerSync.js";

export default function AdminProducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ==========================================
  // PRODUCT STATE
  // ==========================================

  const {
    products,
    productPagination,
    productLoading,
    productSuccess,
    productError,
  } = useSelector((state) => state.product);

  const { categories } = useSelector((state) => state.category);

  const { roomTypes } = useSelector((state) => state.roomType);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [roomType, setRoomType] = useState("");

  const [status, setStatus] = useState("active");

  const [currentPage, setCurrentPage] = useState(1);

  const [sort, setSort] = useState("latest");

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(
      getAdminCategories({
        is_active: true,
      }),
    );

    dispatch(
      getAdminRoomTypes({
        is_active: true,
      }),
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
          status === "all" ? "" : status === "active" ? "true" : "false",
      }),
    );
  }, [dispatch, currentPage, search, category, roomType, sort, status]);

  const refreshAdminProducts = useCallback(() => {
    dispatch(
      getAdminProducts({
        page: currentPage,

        search,

        sort,

        category,

        room_type: roomType,

        is_active:
          status === "all" ? "" : status === "active" ? "true" : "false",
      }),
    );
  }, [dispatch, currentPage, search, sort, category, roomType, status]);

  useBackgroundServerSync({
    enabled: true,

    pollIntervalMs: 90_000,

    onRefresh: refreshAdminProducts,
  });

  const openDeleteModal = (product) => {
    setSelectedProduct(product);

    setDeleteModalOpen(true);
  };

  const handleToggleFeaturedProduct = async (product) => {
    try {
      await dispatch(
        updateProduct({
          productId: product.id,
          data: {
            name: product.name,
            description: product.description,
            category: product.category?.id || product.category,
            room_type_ids: product.room_types?.map((r) => r.id) || [],
            is_active: product.is_active,
            is_featured: !product.is_featured,
          },
        }),
      ).unwrap();
      toast.success("Featured status updated");
    } catch (err) {
      toast.error("Failed to toggle featured status");
    }
  };

  const handleToggleActiveProduct = async (productId) => {
    try {
      await dispatch(toggleProductStatus(productId)).unwrap();
      toast.success("Active status updated");
    } catch (err) {
      // toast is handled in slice
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await dispatch(deleteProduct(selectedProduct.id)).unwrap();

      setDeleteModalOpen(false);

      setSelectedProduct(null);

      const updatedCount = (productPagination?.count || 1) - 1;

      const updatedPages = Math.ceil(updatedCount / 10);

      if (currentPage > updatedPages && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        dispatch(
          getAdminProducts({
            page: currentPage,

            search,

            category,

            room_type: roomType,

            sort,

            is_active:
              status === "all" ? "" : status === "active" ? "true" : "false",
          }),
        );
      }
    } catch (error) {
      /* deleteProduct.rejected sets productError; toast via useEffect */
    }
  };

  const totalPages = productPagination?.totalPages ?? 0;

  const pages = useMemo(() => {
    return Array.from(
      { length: totalPages },

      (_, index) => index + 1,
    );
  }, [totalPages]);

  useEffect(() => {
    if (!productSuccess) return;

    toast.success(productSuccess);

    const timer = setTimeout(() => {
      dispatch(clearProductMessages());
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch, productSuccess]);

  useEffect(() => {
    if (!productError) return;

    toast.error(
      typeof productError === "string"
        ? productError
        : JSON.stringify(productError),
    );

    const timer = setTimeout(() => {
      dispatch(clearProductMessages());
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch, productError]);

  return (
    <div className="admin-products-page">
      {/* HEADER SECTION */}
      <div className="products-header-top">
        <div className="products-breadcrumb">
          <span>CATALOG</span>
          <ChevronRight size={12} color="#9ca3af" />
          <span>ALL PRODUCTS</span>
        </div>
        <div className="products-header-title-row">
          <h1>Products</h1>
          <button
            className="new-product-btn"
            onClick={() => setOpenCreateModal(true)}
          >
            <Plus size={18} /> New Product
          </button>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="status-tabs-container">
        <button
          className={status === "all" ? "status-tab active" : "status-tab"}
          onClick={() => {
            setStatus("all");
            setCurrentPage(1);
          }}
        >
          All Products
        </button>
        <button
          className={status === "active" ? "status-tab active" : "status-tab"}
          onClick={() => {
            setStatus("active");
            setCurrentPage(1);
          }}
        >
          Active
        </button>
        <button
          className={status === "inactive" ? "status-tab active" : "status-tab"}
          onClick={() => {
            setStatus("inactive");
            setCurrentPage(1);
          }}
        >
          Inactive
        </button>
      </div>

      {/* FILTERS CARD */}
      <div className="products-filters-card">
        <div className="filter-group">
          <label>CATEGORY</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories
              ?.filter((item) => item.is_active)
              ?.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        <div className="filter-group">
          <label>ROOM TYPE</label>
          <select
            value={roomType}
            onChange={(e) => {
              setRoomType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Rooms</option>
            {roomTypes
              ?.filter((item) => item.is_active)
              ?.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        <div className="filter-group">
          <label>SORT BY</label>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="a_z">A-Z</option>
            <option value="z_a">Z-A</option>
            <option value="price_low">Price Low to High</option>
            <option value="price_high">Price High to Low</option>
          </select>
        </div>

        <button
          className="clear-filters-btn"
          onClick={() => {
            setCategory("");
            setRoomType("");
            setStatus("all");
            setSort("latest");
            setCurrentPage(1);
          }}
        >
          <Filter size={16} /> Clear
        </button>
      </div>

      {/* TABLE AREA */}
      <div className="products-table-container">
        <div className="products-table-header">
          <span>PRODUCT DETAILS</span>
          <span>ROOM / SPECS</span>
          <span>CREATED</span>
          <span>STATUS</span>
          <span>CONTROLS</span>
        </div>

        {productLoading ? (
          <div className="empty-products">Loading products...</div>
        ) : products?.length > 0 ? (
          <div>
            {products.map((product) => {
              const variants = product.variants || [];
              const thumbnail =
                product.thumbnail ||
                product.image ||
                variants?.[0]?.images?.[0]?.image ||
                "";

              return (
                <div
                  key={product.id}
                  className="products-table-row"
                  onClick={() => navigate(`/admin/products/${product.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {/* COL 1: DETAILS */}
                  <div className="col-details">
                    <img
                      src={thumbnail || "/placeholder.png"}
                      alt={product.name}
                    />
                    <div className="product-info-text">
                      <h4>{product.name}</h4>
                      <p>{product.category_name || "Uncategorized"}</p>
                    </div>
                  </div>

                  {/* COL 2: ROOM / SPECS */}
                  <div className="col-room">
                    <div className="room-tags">
                      {product.room_types?.slice(0, 2).map((room) => (
                        <span key={room.id}>{room.name.toUpperCase()}</span>
                      ))}
                      {product.room_types?.length > 2 && (
                        <span>+{product.room_types.length - 2} MORE</span>
                      )}
                    </div>
                    <div className="variant-count">
                      {variants.length}{" "}
                      {variants.length === 1 ? "Variant" : "Variants"}
                    </div>
                  </div>

                  {/* COL 3: CREATED */}
                  <div className="col-created">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "2-digit", year: "numeric" },
                        )
                      : "-"}
                  </div>

                  {/* COL 4: STATUS */}
                  <div>
                    <span
                      className={
                        product.is_active ? "status-pill active" : "status-pill"
                      }
                    >
                      <span className="status-dot"></span>
                      {product.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>

                  {/* COL 5: CONTROLS */}
                  <div
                    className="col-controls"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="toggles-stack">
                      <div className="toggle-row">
                        <label
                          className="switch"
                          style={{ margin: 0, transform: "scale(0.7)" }}
                        >
                          <input
                            type="checkbox"
                            checked={product.is_featured || false}
                            onChange={() =>
                              handleToggleFeaturedProduct(product)
                            }
                            disabled={productLoading}
                          />
                          <span className="slider"></span>
                        </label>
                        <span>FEATURED</span>
                      </div>
                      <div className="toggle-row">
                        <label
                          className="switch"
                          style={{ margin: 0, transform: "scale(0.7)" }}
                        >
                          <input
                            type="checkbox"
                            checked={product.is_active || false}
                            onChange={() =>
                              handleToggleActiveProduct(product.id)
                            }
                            disabled={productLoading}
                          />
                          <span className="slider"></span>
                        </label>
                        <span>ACTIVE</span>
                      </div>
                    </div>

                    <button
                      className="view-details-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/admin/products/${product.id}`);
                      }}
                    >
                      <Eye size={18} style={{ marginRight: "6px" }} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-products">
            No products found matching your criteria.
          </div>
        )}
      </div>

      {/* FOOTER PAGINATION */}
      {products?.length > 0 && (
        <div className="products-footer">
          <p>
            Showing <strong>{products.length}</strong> of{" "}
            <strong>{productPagination?.count || 0}</strong> products
          </p>
          <div className="pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {pages.map((page) => (
              <button
                type="button"
                key={page}
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => {
            setDeleteModalOpen(false);

            setSelectedProduct(null);
          }}
        >
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product</h3>

            <p>
              Are you sure you want to delete
              <strong> {selectedProduct?.name}</strong>
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
                  setDeleteModalOpen(false);

                  setSelectedProduct(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete-btn"
                onClick={handleDeleteProduct}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <CreateProductModal
        isOpen={openCreateModal}

        onClose={() => setOpenCreateModal(false)}

        onSuccess={() => {
          dispatch(
            getAdminProducts({
              page: currentPage,

              search,

              sort,

              category,

              room_type: roomType,

              is_active:
                status === "all" ? "" : status === "active" ? "true" : "false",
            }),
          );
        }}
      />
    </div>
  );
}
