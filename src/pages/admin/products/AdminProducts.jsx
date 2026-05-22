import ProductTable
from "./ProductTable";
import CreateProductModal
from "./CreateProductModal";
import {
  getAdminCategories,
} from "../../../features/catalog/category/categorySlice";

import {
  getAdminRoomTypes,
} from "../../../features/catalog/roomType/roomTypeSlice";
import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {

  getAdminProducts,
  deleteProduct,

} from "../../../features/catalog/product/productSlice";

export default function AdminProducts() {

  const dispatch = useDispatch();

  const {

    products,
    productPagination,
    productLoading,

  } = useSelector(
    (state) => state.product
  );

  // ==========================================
  // STATES
  // ==========================================

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [statusFilter,
    setStatusFilter] =
    useState("all");

  const [selectedProduct,
    setSelectedProduct] =
    useState(null);
  const [openCreateModal,
    setOpenCreateModal] =
    useState(false);
  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  useEffect(() => {

    const params = {
      search,
      page,
    };

    if (statusFilter !== "all") {

      params.is_active =
        statusFilter;
    }

    dispatch(
      getAdminProducts(params)
    );

    dispatch(
    getAdminCategories()
    );

    dispatch(
    getAdminRoomTypes()
    );

  }, [
    dispatch,
    search,
    page,
    statusFilter,
  ]);

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDelete =
    async (productId) => {

      const confirmDelete =
        window.confirm(
          "Delete this product?"
        );

      if (!confirmDelete) return;

      dispatch(
        deleteProduct(productId)
      );
    };

  // ==========================================
  // EDIT PRODUCT
  // ==========================================

  const handleEdit =
    (product) => {

      setSelectedProduct(product);

      console.log(product);
    };

  return (

    <div className="p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-bold">

          Products

        </h1>

        <button

            onClick={() =>
                setOpenCreateModal(true)
            }

            className="bg-black text-white px-4 py-2 rounded-lg"
            >
            Create Product
            </button>

      </div>

      {/* SEARCH */}

      <div className="mb-6">

        <input
          type="text"
          placeholder="Search products..."
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

      {/* PRODUCT TABLE */}

      <ProductTable

        products={products}

        productLoading={productLoading}

        onEdit={handleEdit}

        onDelete={handleDelete}

      />

      {/* PAGINATION */}

      {productPagination && (

        <div className="flex items-center justify-center gap-3 mt-6">

          <button

            disabled={
              !productPagination.previous
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
              productPagination.currentPage
            } of {
              productPagination.totalPages
            }

          </span>

          <button

            disabled={
              !productPagination.next
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

      <CreateProductModal

        isOpen={openCreateModal}

        onClose={() =>
            setOpenCreateModal(false)
        }

/>

    </div>
  );
}