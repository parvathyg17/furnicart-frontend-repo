import CreateCategoryModal
from "./CreateCategoryModal";
import EditCategoryModal
from "./EditCategoryModal";

import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {

  getAdminCategories,
  deleteCategory,

} from "../../../features/catalog/category/categorySlice";

export default function AdminCategories() {

  const dispatch = useDispatch();

  const {

    categories,
    categoryPagination,
    categoryLoading,

  } = useSelector(
    (state) => state.category
  );

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [statusFilter,
    setStatusFilter] =
    useState("all");

  const [openCreateModal,
    setOpenCreateModal] =
    useState(false);

  const [openEditModal,
  setOpenEditModal] =
  useState(false);

  const [selectedCategory,
  setSelectedCategory] =
  useState(null);

  // ==========================================
  // FETCH CATEGORIES
  // ==========================================

  useEffect(() => {

    const params = {
      search,
      page,
    };

    // ONLY ADD FILTER WHEN NEEDED

    if (statusFilter !== "all") {

      params.is_active =
        statusFilter;
    }

    dispatch(
      getAdminCategories(params)
    );

  }, [
    dispatch,
    search,
    page,
    statusFilter,
  ]);
  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const handleDelete =
    async (categoryId) => {

      const confirmDelete =
        window.confirm(
          "Delete this category?"
        );

      if (!confirmDelete) return;

      dispatch(
        deleteCategory(categoryId)
      );
    };

  return (

    <div className="p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-bold">

          Categories

        </h1>

        <button

          onClick={() =>
            setOpenCreateModal(true)
          }

          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Create Category
        </button>

      </div>

      {/* SEARCH */}

      <div className="mb-6">

        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="border w-full p-3 rounded-lg"
        />

      </div>

      {/* STATUS FILTER */}

      <div className="flex gap-3 mb-6">

        <button

          onClick={() =>
            setStatusFilter("all")
          }

          className={`px-4 py-2 rounded-lg border ${
            statusFilter === "all"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          All
        </button>

        <button

          onClick={() =>
            setStatusFilter("true")
          }

          className={`px-4 py-2 rounded-lg border ${
            statusFilter === "true"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          Active
        </button>

        <button

          onClick={() =>
            setStatusFilter("false")
          }

          className={`px-4 py-2 rounded-lg border ${
            statusFilter === "false"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          Deleted
        </button>

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="text-left p-4">
                Image
              </th>

              <th className="text-left p-4">
                Name
              </th>

              <th className="text-left p-4">
                Parent
              </th>

              <th className="text-left p-4">
                Children
              </th>

              <th className="text-left p-4">
                Status
              </th>

              <th className="text-left p-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {categoryLoading ? (

              <tr>

                <td
                  colSpan="6"
                  className="p-6 text-center"
                >
                  Loading...
                </td>

              </tr>

            ) : categories.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  className="p-6 text-center"
                >
                  No categories found
                </td>

              </tr>

            ) : (

              categories.map(
                (category) => (

                  <tr
                    key={category.id}
                    className={`border-t ${
                      !category.is_active
                        ? "opacity-50"
                        : ""
                    }`}
                  >

                    {/* IMAGE */}

                    <td className="p-4">

                      {category.image ? (

                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-14 h-14 rounded object-cover"
                        />

                      ) : (

                        <div className="w-14 h-14 bg-gray-200 rounded" />

                      )}

                    </td>

                    {/* NAME */}

                    <td className="p-4 font-medium">

                      {category.name}

                    </td>

                    {/* PARENT */}

                    <td className="p-4">

                      {category.parent_name || "-"}

                    </td>

                    {/* CHILDREN */}

                    <td className="p-4">

                      {category.children.length}

                    </td>

                    {/* STATUS */}

                    <td className="p-4">

                      {category.is_active ? (

                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">

                          Active

                        </span>

                      ) : (

                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">

                          Deleted

                        </span>

                      )}

                    </td>

                    {/* ACTIONS */}

                    <td className="p-4">

                      <div className="flex gap-2">

                        <button

                              onClick={() => {

                                setSelectedCategory(
                                  category
                                );

                                setOpenEditModal(true);
                              }}

                              className="px-3 py-1 bg-blue-500 text-white rounded"
                            >
                              Edit
                        </button>

                        {category.is_active && (

                          <button

                            onClick={() =>
                              handleDelete(
                                category.id
                              )
                            }

                            className="px-3 py-1 bg-red-500 text-white rounded"
                          >
                            Delete
                          </button>

                        )}

                      </div>

                    </td>

                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      {categoryPagination && (

        <div className="flex items-center justify-center gap-3 mt-6">

          <button

            disabled={
              !categoryPagination.previous
            }

            onClick={() =>
              setPage((prev) =>
                prev - 1
              )
            }

            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>

            Page {
              categoryPagination.currentPage
            } of {
              categoryPagination.totalPages
            }

          </span>

          <button

            disabled={
              !categoryPagination.next
            }

            onClick={() =>
              setPage((prev) =>
                prev + 1
              )
            }

            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>

        </div>
      )}

      <CreateCategoryModal

        isOpen={openCreateModal}

        onClose={() =>
          setOpenCreateModal(false)
        }

        
      />

      <EditCategoryModal

          isOpen={openEditModal}

          onClose={() =>
            setOpenEditModal(false)
          }

          category={selectedCategory}
        />

    </div>
  );
}