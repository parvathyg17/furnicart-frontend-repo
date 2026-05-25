import "../../../styles/admincategories.css";

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";

import {

  getAdminCategories,
  deleteCategory,
  restoreCategory,

} from "../../../features/catalog/category/categorySlice";
import CreateCategoryModal from "./CreateCategoryModal";
import EditCategoryModal from "./EditCategoryModal";

export default function AdminCategories() {

  const dispatch = useDispatch();

  const {

    categories,
    categoryPagination,
    categoryLoading,

  } = useSelector(
    (state) => state.category
  );

  const [
    activeTab,
    setActiveTab,
  ] = useState("all");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


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
  // FETCH
  // ==========================================

  useEffect(() => {

    let params = {

      page: currentPage,
    };

    if (activeTab === "active") {

      params.is_active = true;
    }

    if (activeTab === "deleted") {

      params.is_active = false;
    }

    dispatch(
      getAdminCategories(params)
    );

  }, [

    dispatch,
    currentPage,
    activeTab,
  ]);

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete =
    (categoryId) => {

      dispatch(
        deleteCategory(categoryId)
      );
    };


    const handleEdit =
      (category) => {

        setSelectedCategory(
          category
        );

        setShowEditModal(true);
      };

  // ==========================================
  // RESTORE
  // ==========================================

  const handleRestore =
    (categoryId) => {

      dispatch(
        restoreCategory(categoryId)
      );
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

        {/* FILTERS */}

        <div className="categories-toolbar">

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

          <div className="toolbar-actions">

            <button className="toolbar-btn">

              <SlidersHorizontal size={18} />

              Advanced Filter

            </button>

            <button className="toolbar-btn">

              <ArrowUpDown size={18} />

              Sort: A-Z

            </button>

          </div>

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

            ) : (

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
                        alt=""
                      />

                    </div>

                    {/* NAME */}

                    <div className="category-name-cell">

                      {category.name}

                    </div>

                    {/* PARENT */}

                    <div className="category-parent-cell">

                      {
                        category.parent_name ||

                        "-"
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
            )
          }

        </div>

        {/* FOOTER */}

        <div className="category-footer">

          <p>

            Showing

            {" "}

            {
              categories.length
            }

            {" "}

            of

            {" "}

            {
              categoryPagination?.count || 0
            }

            {" "}

            categories

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

              Page

              {" "}

              {
                categoryPagination?.currentPage
              }

              {" "}

              of

              {" "}

              {
                categoryPagination?.totalPages
              }

            </div>

            <button

              disabled={
                !categoryPagination?.next
              }

              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    prev + 1
                )
              }
            >

              Next

              <ChevronRight size={18} />

            </button>

          </div>

        </div>
        

      </div>

      {/* CREATE CATEGORY MODAL */}

        <CreateCategoryModal

          isOpen={showCreateModal}

          onClose={() =>
            setShowCreateModal(false)
          }

        />

        {/* EDIT CATEGORY MODAL */}

        <EditCategoryModal

          isOpen={showEditModal}

          onClose={() => {

            setShowEditModal(false);

            setSelectedCategory(null);
          }}

          category={selectedCategory}

        />
              

    </div>
  );
}