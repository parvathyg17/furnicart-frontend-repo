import "../../../styles/admincategories.css";

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

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

import CreateCategoryModal
from "./CreateCategoryModal";

import EditCategoryModal
from "./EditCategoryModal";

export default function AdminCategories() {

  const dispatch = useDispatch();

  const {

    categories,
    categoryPagination,
    categoryLoading,
    categorySuccess,

  } = useSelector(
    (state) => state.category
  );

  // ==========================================
  // STATES
  // ==========================================

  const [
    activeTab,
    setActiveTab,
  ] = useState("active");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    sort,
    setSort,
  ] = useState("latest");

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    showEditModal,
    setShowEditModal,
  ] = useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  // ==========================================
  // CONFIRM MODAL STATES
  // ==========================================

  const [
    showConfirmModal,
    setShowConfirmModal,
  ] = useState(false);

  const [
    confirmAction,
    setConfirmAction,
  ] = useState(null);

  const [
    confirmText,
    setConfirmText,
  ] = useState("");

  // ==========================================
  // TOASTS
  // ==========================================

  useEffect(() => {

    if (categorySuccess) {

      toast.success(categorySuccess);

      dispatch(
        clearCategoryMessages()
      );
    }

  }, [

    categorySuccess,
    dispatch,

  ]);

  // ==========================================
  // RESET PAGE
  // ==========================================

  useEffect(() => {

    setCurrentPage(1);

  }, [

    activeTab,
    search,
    sort,

  ]);

  // ==========================================
  // FETCH
  // ==========================================

  useEffect(() => {

    const params = {

      page: currentPage,

      search,

      sort,
    };

    if (activeTab === "active") {

      params.is_active = "true";
    }

    if (activeTab === "deleted") {

      params.is_active = "false";
    }

    dispatch(
      getAdminCategories(params)
    );

  }, [

    dispatch,
    currentPage,
    activeTab,
    search,
    sort,

  ]);

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete =
    (categoryId) => {

      setConfirmText(
        "Are you sure you want to delete this category?"
      );

      setConfirmAction(() =>
        async () => {

          const result =
            await dispatch(
              deleteCategory(categoryId)
            );

          if (
            deleteCategory.rejected.match(
              result
            )
          ) {

            return;
          }

          if (
            categories.length === 1 &&
            currentPage > 1
          ) {

            setCurrentPage(
              (prev) => prev - 1
            );

            return;
          }

          const params = {

            page: currentPage,

            search,

            sort,
          };

          if (activeTab === "active") {

            params.is_active = "true";
          }

          if (activeTab === "deleted") {

            params.is_active = "false";
          }

          dispatch(
            getAdminCategories(params)
          );
        }
      );

      setShowConfirmModal(true);
    };

  // ==========================================
  // RESTORE
  // ==========================================

  const handleRestore =
    (categoryId) => {

      setConfirmText(
        "Are you sure you want to restore this category?"
      );

      setConfirmAction(() =>
        async () => {

          const result =
            await dispatch(
              restoreCategory(categoryId)
            );

          if (
            restoreCategory.rejected.match(
              result
            )
          ) {

            return;
          }

          if (
            categories.length === 1 &&
            currentPage > 1
          ) {

            setCurrentPage(
              (prev) => prev - 1
            );

            return;
          }

          const params = {

            page: currentPage,

            search,

            sort,
          };

          if (activeTab === "active") {

            params.is_active = "true";
          }

          if (activeTab === "deleted") {

            params.is_active = "false";
          }

          dispatch(
            getAdminCategories(params)
          );
        }
      );

      setShowConfirmModal(true);
    };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit =
    (category) => {

      setSelectedCategory(
        category
      );

      setShowEditModal(true);
    };

  return (

    <div className="admin-categories-page">

      {/* HEADER */}

      <div className="categories-topbar">

        <div>

          <div className="breadcrumb">

            Catalog

            <span>/</span>

            Categories

          </div>

          <h1>

            Category Management

          </h1>

        </div>

        <button
          className="create-category-btn"
          onClick={() =>
            setShowCreateModal(true)
          }
        >

          <Plus size={18} />

          Create Category

        </button>

      </div>

      {/* CARD */}

      <div className="categories-card">

        {/* TOOLBAR */}

        <div className="categories-toolbar">

          {/* SEARCH */}

          <div className="category-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          {/* TABS */}

          <div className="category-tabs">

            <button
              className={
                activeTab === "all"
                  ? "tab-btn active"
                  : "tab-btn"
              }
              onClick={() =>
                setActiveTab("all")
              }
            >

              All

            </button>

            <button
              className={
                activeTab === "active"
                  ? "tab-btn active"
                  : "tab-btn"
              }
              onClick={() =>
                setActiveTab("active")
              }
            >

              Active

            </button>

            <button
              className={
                activeTab === "deleted"
                  ? "tab-btn active"
                  : "tab-btn"
              }
              onClick={() =>
                setActiveTab("deleted")
              }
            >

              Deleted

            </button>

          </div>

          {/* SORT */}

          <select
            value={sort}
            onChange={(e) =>
              setSort(
                e.target.value
              )
            }
            className="category-sort"
          >

            <option value="latest">
              Most Recent
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

          </select>

        </div>

        {/* TABLE */}

        <div className="category-table">

          {/* HEADER */}

          <div className="category-table-header">

            <div>Image</div>

            <div>Name</div>

            <div>Parent</div>

            <div>Children</div>

            <div>Status</div>

            <div>Actions</div>

          </div>

          {/* ROWS */}

          {
            categoryLoading ? (

              <div className="empty-state">

                Loading categories...

              </div>

            ) : categories?.length > 0 ? (

              categories.map(
                (category) => (

                  <div
                    key={category.id}
                    className="category-row"
                  >

                    {/* IMAGE */}

                    <div className="category-image-cell">

                      <img
                        src={
                          category.image_url ||
                          "https://placehold.co/80x80"
                        }
                        alt={category.name}
                      />

                    </div>

                    {/* NAME */}

                    <div className="category-name-cell">

                      {category.name}

                    </div>

                    {/* PARENT */}

                    <div className="category-parent-cell">

                      {
                        category.parent_name || "-"
                      }

                    </div>

                    {/* CHILDREN */}

                    <div className="category-count-cell">

                      {
                        category.children_count
                      }

                    </div>

                    {/* STATUS */}

                    <div>

                      {
                        category.is_active ? (

                          <span className="status-pill active">

                            Active

                          </span>

                        ) : (

                          <span className="status-pill deleted">

                            Deleted

                          </span>

                        )
                      }

                    </div>

                    {/* ACTIONS */}

                    <div className="category-actions">

                      <button
                        className="icon-btn"
                        onClick={() =>
                          handleEdit(category)
                        }
                      >

                        <Pencil size={18} />

                      </button>

                      {
                        category.is_active ? (

                          <button
                            className="icon-btn delete-btn"
                            onClick={() =>
                              handleDelete(
                                category.id
                              )
                            }
                          >

                            <Trash2 size={18} />

                          </button>

                        ) : (

                          <button
                            className="restore-btn"
                            onClick={() =>
                              handleRestore(
                                category.id
                              )
                            }
                          >

                            <RotateCcw size={16} />

                            Restore

                          </button>

                        )
                      }

                    </div>

                  </div>
                )
              )

            ) : (

              <div className="empty-state">

                No categories found

              </div>

            )
          }

        </div>

        {/* FOOTER */}

        <div className="category-footer">

          <p>

            Showing{" "}

            {
              categories.length
            }

            {" "}of{" "}

            {
              categoryPagination?.count || 0
            }

            {" "}categories

          </p>

          <div className="pagination">

            <button
              disabled={
                !categoryPagination?.previous
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

              Prev

            </button>

            <div className="page-indicator">

              Page{" "}

              {
                categoryPagination?.currentPage || 1
              }

              {" "}of{" "}

              {
                categoryPagination?.totalPages || 1
              }

            </div>

            <button
              disabled={
                !categoryPagination?.next
              }
              onClick={() =>
                setCurrentPage(
                  (prev) => prev + 1
                )
              }
            >

              Next

              <ChevronRight size={18} />

            </button>

          </div>

        </div>

      </div>

      {/* CREATE MODAL */}

      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() =>
          setShowCreateModal(false)
        }
      />

      {/* EDIT MODAL */}

      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {

          setShowEditModal(false);

          setSelectedCategory(null);
        }}
        category={selectedCategory}
      />

      {/* CONFIRM MODAL */}

      {
        showConfirmModal && (

          <div className="confirm-modal-overlay">

            <div className="confirm-modal">

              <h3>

                Confirm Action

              </h3>

              <p>

                {confirmText}

              </p>

              <div className="confirm-modal-actions">

                <button
                  className="confirm-cancel-btn"
                  onClick={() => {

                    setShowConfirmModal(false);

                    setConfirmAction(null);
                  }}
                >

                  Cancel

                </button>

                <button
                  className="confirm-submit-btn"
                  onClick={async () => {

                    if (confirmAction) {

                      await confirmAction();
                    }

                    setShowConfirmModal(false);

                    setConfirmAction(null);
                  }}
                >

                  Confirm

                </button>

              </div>

            </div>

          </div>
        )
      }

    </div>
  );
}