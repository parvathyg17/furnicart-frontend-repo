import "../../../styles/adminproducts.css";

import { useEffect, useState, useCallback, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import {
  getAdminCategories,
  deleteCategory,
  restoreCategory,
  clearCategoryMessages,
} from "../../../features/catalog/category/categorySlice";

import CreateCategoryModal from "./CreateCategoryModal";

import EditCategoryModal from "./EditCategoryModal";

import ConfirmDialog from "../../../components/common/ConfirmDialog";

import { useBackgroundServerSync } from "../../../hooks/useBackgroundServerSync.js";

export default function AdminCategories() {
  const dispatch = useDispatch();

  const {
    categories,
    categoryPagination,

    categoryListLoading,

    categoryUpdateLoading,

    categoryDeleteLoading,

    categoryRestoreLoading,

    categorySuccess,

    categoryError,
  } = useSelector((state) => state.category);

  const [activeTab, setActiveTab] = useState("active");

  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState("latest");

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);

  const [confirmText, setConfirmText] = useState("");

  const totalPages = categoryPagination?.totalPages ?? 0;

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  useEffect(() => {
    if (categorySuccess) {
      toast.success(categorySuccess);

      const timer = setTimeout(() => {
        dispatch(clearCategoryMessages());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [categorySuccess, dispatch]);

  useEffect(() => {
    if (
      !categoryListLoading &&
      currentPage > (categoryPagination?.totalPages || 1)
    ) {
      setCurrentPage(categoryPagination?.totalPages || 1);
    }
  }, [currentPage, categoryPagination, categoryListLoading]);

  useEffect(() => {
    if (categoryError) {
      toast.error(categoryError);

      const timer = setTimeout(() => {
        dispatch(clearCategoryMessages());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [categoryError, dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, sort]);

  const fetchCategories = useCallback(
    (page = currentPage) => {
      const params = {
        page,

        search,

        sort,
      };

      if (activeTab === "active") {
        params.is_active = "true";
      }

      if (activeTab === "deleted") {
        params.is_active = "false";
      }

      dispatch(getAdminCategories(params));
    },

    [dispatch, currentPage, search, sort, activeTab],
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useBackgroundServerSync({
    enabled: true,

    pollIntervalMs: 120_000,

    onRefresh: fetchCategories,
  });

  const handleDelete = (categoryId) => {
    setConfirmText("Are you sure you want to delete this category?");

    setConfirmAction(() => async () => {
      const result = await dispatch(deleteCategory(categoryId));

      if (deleteCategory.rejected.match(result)) {
        return;
      }

      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);

        return;
      }

      fetchCategories();
    });

    setShowConfirmModal(true);
  };

  const handleRestore = (categoryId) => {
    setConfirmText("Are you sure you want to restore this category?");

    setConfirmAction(() => async () => {
      const result = await dispatch(restoreCategory(categoryId));

      if (restoreCategory.rejected.match(result)) {
        return;
      }

      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);

        return;
      }

      fetchCategories();
    });

    setShowConfirmModal(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);

    setShowEditModal(true);
  };

  return (
    <div className="admin-products-page">
      {/* HEADER SECTION */}
      <div className="products-header-top">
        <div className="products-breadcrumb">
          <span>CATALOG</span>
          <ChevronRight size={12} color="#9ca3af" />
          <span>CATEGORIES</span>
        </div>
        <div className="products-header-title-row">
          <h1>Categories</h1>
          <button
            className="new-product-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} /> Create Category
          </button>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="status-tabs-container">
        <button
          className={activeTab === "all" ? "status-tab active" : "status-tab"}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={
            activeTab === "active" ? "status-tab active" : "status-tab"
          }
          onClick={() => setActiveTab("active")}
        >
          Active
        </button>
        <button
          className={
            activeTab === "deleted" ? "status-tab active" : "status-tab"
          }
          onClick={() => setActiveTab("deleted")}
        >
          Deleted
        </button>
      </div>

      {/* FILTERS CARD */}
      <div className="products-filters-card">
        <div className="filter-group">
          <label>SEARCH</label>
          <input
            type="text"
            placeholder="Search categories by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group" style={{ maxWidth: "240px" }}>
          <label>SORT BY</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="latest">Most Recent</option>
            <option value="oldest">Oldest</option>
            <option value="a_z">A-Z</option>
            <option value="z_a">Z-A</option>
          </select>
        </div>

        <button
          className="clear-filters-btn"
          onClick={() => {
            setSearch("");
            setSort("latest");
            setActiveTab("all");
          }}
        >
          Clear
        </button>
      </div>

      {/* TABLE AREA */}
      <div className="products-table-container">
        <div
          className="products-table-header"
          style={{ gridTemplateColumns: "80px 2fr 1.5fr 1fr 1.2fr 1.5fr" }}
        >
          <span>IMAGE</span>
          <span>NAME</span>
          <span>PARENT</span>
          <span>CHILDREN</span>
          <span>STATUS</span>
          <span style={{ textAlign: "right" }}>ACTIONS</span>
        </div>

        {categoryListLoading ? (
          <div className="empty-products">Loading categories...</div>
        ) : categories?.length > 0 ? (
          <div>
            {categories.map((category) => (
              <div
                key={category.id}
                className="products-table-row"
                style={{
                  gridTemplateColumns: "80px 2fr 1.5fr 1fr 1.2fr 1.5fr",
                  alignItems: "center",
                }}
              >
                {/* Image Column */}
                <div className="col-details">
                  <img
                    src={category.image_url || "https://placehold.co/80x80"}
                    alt={category.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                </div>

                {/* Name Column */}
                <div className="product-info-text">
                  <h4 style={{ margin: 0, fontSize: "16px" }}>
                    {category.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px" }}>
                    /{category.slug}
                  </p>
                </div>

                {/* Parent Column */}
                <div className="col-created" style={{ fontSize: "14px" }}>
                  {category.parent_name || "—"}
                </div>

                {/* Children Column */}
                <div className="col-room" style={{ fontSize: "14px" }}>
                  <div className="variant-count">
                    {category.children_count}{" "}
                    {category.children_count === 1
                      ? "Subcategory"
                      : "Subcategories"}
                  </div>
                </div>

                {/* Status Column */}
                <div>
                  <span
                    className={
                      category.is_active ? "status-pill active" : "status-pill"
                    }
                  >
                    <span className="status-dot"></span>
                    {category.is_active ? "ACTIVE" : "DELETED"}
                  </span>
                </div>

                {/* Actions Column */}
                <div
                  className="col-controls"
                  style={{ justifyContent: "flex-end", gap: "8px" }}
                >
                  <button
                    className="view-details-btn"
                    disabled={categoryUpdateLoading}
                    onClick={() => handleEdit(category)}
                    style={{ padding: "6px 10px" }}
                    title="Edit Category"
                  >
                    <Pencil size={16} />
                  </button>

                  {category.is_active ? (
                    <button
                      className="view-details-btn"
                      disabled={categoryDeleteLoading}
                      onClick={() => handleDelete(category.id)}
                      style={{
                        padding: "6px 10px",
                        borderColor: "#fecaca",
                        color: "#ef4444",
                      }}
                      title="Delete Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      className="view-details-btn"
                      disabled={categoryRestoreLoading}
                      onClick={() => handleRestore(category.id)}
                      style={{
                        padding: "6px 10px",
                        borderColor: "#bbf7d0",
                        color: "#16a34a",
                      }}
                      title="Restore Category"
                    >
                      <RotateCcw size={16} style={{ marginRight: "4px" }} />
                      Restore
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-products">No categories found.</div>
        )}
      </div>

      {/* FOOTER */}
      {categories?.length > 0 && (
        <div className="products-footer">
          <p>
            Showing <strong>{categories.length}</strong> of{" "}
            <strong>{categoryPagination?.count || 0}</strong> categories
          </p>
          <div className="pagination">
            <button
              disabled={currentPage === 1 || categoryListLoading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              style={{
                width: "auto",
                minWidth: "36px",
                padding: "0 12px",
                gap: "6px",
              }}
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>
            {pages.map((pNum) => (
              <button
                type="button"
                key={pNum}
                className={currentPage === pNum ? "active" : ""}
                onClick={() => setCurrentPage(pNum)}
              >
                {pNum}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages || categoryListLoading}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              style={{
                width: "auto",
                minWidth: "36px",
                padding: "0 12px",
                gap: "6px",
              }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          if (currentPage !== 1) {
            setCurrentPage(1);
          } else {
            fetchCategories(1);
          }
        }}
      />

      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);

          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSuccess={() => {
          fetchCategories();
        }}
      />

      <ConfirmDialog
        open={showConfirmModal}
        titleId="confirm-action-title"
        title="Confirm Action"
        hint={confirmText}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (confirmAction) {
            await confirmAction();
          }
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onCancel={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        busy={categoryDeleteLoading || categoryRestoreLoading}
      />
    </div>
  );
}
