import "../../../styles/adminroomtypes.css";

import CreateRoomTypeModal
from "./CreateRoomTypeModal";

import EditRoomTypeModal
from "./EditRoomTypeModal";

import {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import toast from "react-hot-toast";

import {

  getAdminRoomTypes,
  deleteRoomType,
  restoreRoomType,
  clearRoomTypeMessages,

} from "../../../features/catalog/roomType/roomTypeSlice";

import {
  useBackgroundServerSync,
} from "../../../hooks/useBackgroundServerSync.js";

import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminRoomTypes() {

  const dispatch = useDispatch();

 const {

    roomTypes,
    roomTypePagination,
    roomTypeListLoading,
    roomTypeDeleteLoading,
    roomTypeRestoreLoading,
    roomTypeUpdateLoading,
    roomTypeError,
    roomTypeSuccess,

  } = useSelector(
    (state) => state.roomType
  );

  const [page, setPage] =
    useState(1);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("true");

  const [
    sort,
    setSort,
  ] = useState("latest");

  const [
    openCreateModal,
    setOpenCreateModal,
  ] = useState(false);

  const [
    openEditModal,
    setOpenEditModal,
  ] = useState(false);

  const [
    selectedRoomType,
    setSelectedRoomType,
  ] = useState(null);

  useEffect(() => {

    if (roomTypeSuccess) {

      toast.success(roomTypeSuccess);

      const timer =
        setTimeout(() => {

          dispatch(
            clearRoomTypeMessages()
          );

        }, 3000);

      return () =>
        clearTimeout(timer);
    }

  }, [roomTypeSuccess, dispatch]);

  useEffect(() => {

    if (roomTypeError) {

      toast.error(roomTypeError);

      const timer =
        setTimeout(() => {

          dispatch(
            clearRoomTypeMessages()
          );

        }, 3000);

      return () =>
        clearTimeout(timer);
    }

  }, [roomTypeError, dispatch]);

  useEffect(() => {

    if (

      !roomTypeListLoading &&

      page >

      (
        roomTypePagination?.totalPages || 1
      )

    ) {

      setPage(

        roomTypePagination?.totalPages || 1
      );
    }

  }, [

    page,
    roomTypePagination,
    roomTypeListLoading,

  ]);

  const fetchRoomTypes =
    useCallback(

      (
        targetPage = page
      ) => {

        const params = {

          page: targetPage,

          search,

          sort,
        };

        if (
          statusFilter !== "all"
        ) {

          params.is_active =
            statusFilter;
        }

        dispatch(
          getAdminRoomTypes(params)
        );
      },

      [
        dispatch,
        page,
        search,
        statusFilter,
        sort,
      ]
    );

  useEffect(() => {

    fetchRoomTypes();

  }, [fetchRoomTypes]);

  useBackgroundServerSync(
    {

      enabled: true,

      pollIntervalMs: 120_000,

      onRefresh:
        fetchRoomTypes,
    },
  );

  const handleDelete =
    async (roomTypeId) => {

      const result =
        await dispatch(
          deleteRoomType(roomTypeId)
        );

      if (
        !deleteRoomType.fulfilled.match(
          result
        )
      ) {

        return;
      }

      if (
        roomTypes.length === 1 &&
        page > 1
      ) {

        setPage(
          (prev) => prev - 1
        );

        return;
      }

      fetchRoomTypes(page);
    };

  const handleRestore =
    async (roomTypeId) => {

      const result =
        await dispatch(
          restoreRoomType(roomTypeId)
        );

      if (
        !restoreRoomType.fulfilled.match(
          result
        )
      ) {

          return;
      }

      if (
        roomTypes.length === 1 &&
        page > 1
      ) {

        setPage(
          (prev) => prev - 1
        );

        return;
      }

      fetchRoomTypes(page);
    };

  const handleCreateSuccess =
    () => {

      if (page !== 1) {

        setPage(1);

      } else {

        fetchRoomTypes(1);
      }
    };

  const handleEditSuccess =
    () => {

      fetchRoomTypes(page);
    };

  const handleEdit =
    (roomType) => {

      setSelectedRoomType(
        roomType
      );

      setOpenEditModal(true);
    };

  return (

    <div className="admin-room-types-page">

      <div className="room-types-header">

        <div className="room-types-header-left">

          <p>

            Dashboard / Inventory

          </p>

          <h1>

            Room Types

          </h1>

        </div>

        <button
          className="create-room-type-btn"
          onClick={() =>
            setOpenCreateModal(true)
          }
        >

          <Plus size={18} />

          Create Room Type

        </button>

      </div>

      <div className="room-types-card">

        <div className="room-types-toolbar">

          <input
            type="text"
            placeholder="Search room types..."
            value={search}
            onChange={(e) => {

              setPage(1);

              setSearch(
                e.target.value
              );
            }}
            className="room-type-search"
          />

          <div className="room-type-tabs">

            <button
              className={
                statusFilter === "all"

                  ? "room-type-tab active"

                  : "room-type-tab"
              }
              onClick={() => {

                setPage(1);

                setStatusFilter("all");
              }}
            >

              All

            </button>

            <button
              className={
                statusFilter === "true"

                  ? "room-type-tab active"

                  : "room-type-tab"
              }
              onClick={() => {

                setPage(1);

                setStatusFilter("true");
              }}
            >

              Active

            </button>

            <button
              className={
                statusFilter === "false"

                  ? "room-type-tab active"

                  : "room-type-tab"
              }
              onClick={() => {

                setPage(1);

                setStatusFilter("false");
              }}
            >

              Deleted

            </button>

          </div>

          <select
            value={sort}
            onChange={(e) => {

              setPage(1);

              setSort(
                e.target.value
              );
            }}
            className="sort-box"
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

        <div className="room-type-table">

          <div className="room-type-table-header">

            <div>Image</div>

            <div>Name</div>

            <div>Status</div>

            <div>Actions</div>

          </div>

          {
            roomTypeListLoading ? (

              <div className="room-type-row">

                Loading...

              </div>

            ) : roomTypes?.length > 0 ? (

              roomTypes.map(
                (roomType) => (

                  <div
                    key={roomType.id}
                    className="room-type-row"
                  >

                    <div>

                      <img
                        src={
                          roomType.image ||

                          "https://placehold.co/80x80"
                        }
                        alt={roomType.name}
                        className="room-type-image"
                      />

                    </div>

                    <div className="room-type-name">

                      {roomType.name}

                    </div>

                    <div>

                      {
                        roomType.is_active ? (

                          <div className="room-type-status active">

                            <div className="status-dot" />

                            Active

                          </div>

                        ) : (

                          <div className="room-type-status deleted">

                            <div className="status-dot" />

                            Deleted

                          </div>

                        )
                      }

                    </div>

                    <div className="room-type-actions">

                      <button
                        className="action-btn"
                        disabled={
                          roomTypeUpdateLoading
                        }
                        onClick={() =>
                          handleEdit(roomType)
                        }
                      >

                        <Pencil size={18} />

                      </button>

                      {
                        roomType.is_active ? (

                          <button
                            className="action-btn"
                            disabled={
                              roomTypeDeleteLoading
                            }
                            onClick={() =>
                              handleDelete(
                                roomType.id
                              )
                            }
                          >

                            <Trash2 size={18} />

                          </button>

                        ) : (

                          <button
                            className="action-btn"
                            disabled={
                              roomTypeRestoreLoading
                            }
                            onClick={() =>
                              handleRestore(
                                roomType.id
                              )
                            }
                          >

                            <RotateCcw size={18} />

                          </button>

                        )
                      }

                    </div>

                  </div>
                )
              )

            ) : (

              <div className="room-type-row">

                No room types found

              </div>

            )
          }

        </div>

        <div className="room-types-footer">

          <button
            className="pagination-btn"
            disabled={
              !roomTypePagination?.previous ||
              roomTypeListLoading
            }
            onClick={() =>
              setPage(
                (prev) =>
                  prev - 1
              )
            }
          >

            <ChevronLeft size={16} />

            Prev

          </button>

          <div className="page-text">

            Page{" "}

            {
              roomTypePagination?.currentPage || 1
            }

            {" "}of{" "}

            {
              roomTypePagination?.totalPages || 1
            }

          </div>

          <button
            className="pagination-btn"
            disabled={
              !roomTypePagination?.next ||
              roomTypeListLoading
            }
            onClick={() =>
              setPage(
                (prev) =>
                  prev + 1
              )
            }
          >

            Next

            <ChevronRight size={16} />

          </button>

        </div>

      </div>

      <CreateRoomTypeModal
        isOpen={openCreateModal}
        onClose={() =>
          setOpenCreateModal(false)
        }
        onSuccess={
          handleCreateSuccess
        }
      />

      <EditRoomTypeModal
        isOpen={openEditModal}
        onClose={() => {

          setOpenEditModal(false);

          setSelectedRoomType(null);
        }}
        roomType={selectedRoomType}
        onSuccess={
          handleEditSuccess
        }
      />

    </div>
  );
}
