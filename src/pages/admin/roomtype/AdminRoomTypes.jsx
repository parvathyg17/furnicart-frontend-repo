import CreateRoomTypeModal
from "./CreateRoomTypeModal";
import EditRoomTypeModal
from "./EditRoomTypeModal";
import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {

  getAdminRoomTypes,
  deleteRoomType,

} from "../../../features/catalog/catalogSlice";

export default function AdminRoomTypes() {

  const dispatch = useDispatch();

  const {

    roomTypes,
    roomTypePagination,
    roomTypeLoading,

  } = useSelector(
    (state) => state.catalog
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

    const [selectedRoomType,
    setSelectedRoomType] =
    useState(null);

  
  // ==========================================
  // FETCH ROOM TYPES
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
      getAdminRoomTypes(params)
    );

  }, [
    dispatch,
    search,
    page,
    statusFilter,
  ]);

  // ==========================================
  // DELETE ROOM TYPE
  // ==========================================

  const handleDelete =
    async (roomTypeId) => {

      const confirmDelete =
        window.confirm(
          "Delete this room type?"
        );

      if (!confirmDelete) return;

      dispatch(
        deleteRoomType(roomTypeId)
      );
    };

    const handleEdit = (
        roomType
        ) => {

        setSelectedRoomType(
            roomType
        );

        setOpenEditModal(true);
        };

  return (

    <div className="p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-bold">

          Room Types

        </h1>

        <button

          onClick={() =>
            setOpenCreateModal(true)
          }

          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Create Room Type
        </button>

      </div>

      {/* SEARCH */}

      <div className="mb-6">

        <input
          type="text"
          placeholder="Search room types..."
          value={search}

          onChange={(e) => {

            setSearch(
              e.target.value
            );

            setPage(1);
          }}

          className="border w-full p-3 rounded-lg"
        />

      </div>

      {/* STATUS FILTER */}

      <div className="flex gap-3 mb-6">

        <button

          onClick={() => {

            setStatusFilter("all");

            setPage(1);
          }}

          className={`px-4 py-2 rounded-lg border ${
            statusFilter === "all"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          All
        </button>

        <button

          onClick={() => {

            setStatusFilter("true");

            setPage(1);
          }}

          className={`px-4 py-2 rounded-lg border ${
            statusFilter === "true"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          Active
        </button>

        <button

          onClick={() => {

            setStatusFilter("false");

            setPage(1);
          }}

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
                Status
              </th>

              <th className="text-left p-4">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {roomTypeLoading ? (

              <tr>

                <td
                  colSpan="4"
                  className="p-6 text-center"
                >
                  Loading...
                </td>

              </tr>

            ) : roomTypes.length === 0 ? (

              <tr>

                <td
                  colSpan="4"
                  className="p-6 text-center"
                >
                  No room types found
                </td>

              </tr>

            ) : (

              roomTypes.map(
                (roomType) => (

                  <tr
                    key={roomType.id}

                    className={`border-t ${
                      !roomType.is_active
                        ? "opacity-50"
                        : ""
                    }`}
                  >

                    {/* IMAGE */}

                    <td className="p-4">

                      {roomType.image ? (

                        <img
                          src={roomType.image}
                          alt={roomType.name}
                          className="w-14 h-14 rounded object-cover"
                        />

                      ) : (

                        <div className="w-14 h-14 bg-gray-200 rounded" />

                      )}

                    </td>

                    {/* NAME */}

                    <td className="p-4 font-medium">

                      {roomType.name}

                    </td>

                    {/* STATUS */}

                    <td className="p-4">

                      {roomType.is_active ? (

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

                            onClick={() =>
                                handleEdit(roomType)
                            }

                            className="px-3 py-1 bg-blue-500 text-white rounded"
                            >
                            Edit
                        </button>

                        {roomType.is_active && (

                          <button

                            onClick={() =>
                              handleDelete(
                                roomType.id
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

      {roomTypePagination && (

        <div className="flex items-center justify-center gap-3 mt-6">

          <button

            disabled={
              !roomTypePagination.previous
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
              roomTypePagination.currentPage
            } of {
              roomTypePagination.totalPages
            }

          </span>

          <button

            disabled={
              !roomTypePagination.next
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

      {/* CREATE MODAL */}

      <CreateRoomTypeModal

        isOpen={openCreateModal}

        onClose={() =>
          setOpenCreateModal(false)
        }
      />
      <EditRoomTypeModal

        isOpen={openEditModal}

        onClose={() =>
            setOpenEditModal(false)
        }

        roomType={selectedRoomType}
        />

    </div>
  );
}