import "../../../styles/adminroomtypes.css";

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
  restoreRoomType,

} from "../../../features/catalog/roomType/roomTypeSlice";

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
    roomTypeLoading,

  } = useSelector(
    (state) => state.roomType
  );

  // ==========================================
  // STATES
  // ==========================================

  const [page, setPage] =
    useState(1);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("active");

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

  // ==========================================
  // FETCH ROOM TYPES
  // ==========================================

  useEffect(() => {

    const params = {

      page,

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

  }, [

    dispatch,
    page,
    search,
    statusFilter,
    sort,

  ]);

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete =
    async (roomTypeId) => {

      await dispatch(
        deleteRoomType(roomTypeId)
      );

      if (
        roomTypes.length === 1 &&
        page > 1
      ) {

        setPage(
          (prev) => prev - 1
        );

        return;
      }

      const params = {

        page,

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
    };

  // ==========================================
  // RESTORE
  // ==========================================

  const handleRestore =
    async (roomTypeId) => {

      await dispatch(
        restoreRoomType(roomTypeId)
      );

      if (
        roomTypes.length === 1 &&
        page > 1
      ) {

        setPage(
          (prev) => prev - 1
        );

        return;
      }

      const params = {

        page,

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
    };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit =
    (roomType) => {

      setSelectedRoomType(
        roomType
      );

      setOpenEditModal(true);
    };

  return (

    <div className="admin-room-types-page">

      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

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

      {/* ========================================== */}
      {/* CARD */}
      {/* ========================================== */}

      <div className="room-types-card">

        {/* ========================================== */}
        {/* TOOLBAR */}
        {/* ========================================== */}

        <div className="room-types-toolbar">

          {/* SEARCH */}

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

          {/* STATUS TABS */}

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

          {/* SORT */}

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

        {/* ========================================== */}
        {/* TABLE */}
        {/* ========================================== */}

        <div className="room-type-table">

          {/* HEADER */}

          <div className="room-type-table-header">

            <div>Image</div>

            <div>Name</div>

            <div>Status</div>

            <div>Actions</div>

          </div>

          {/* ROWS */}

          {
            roomTypeLoading ? (

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

                    {/* IMAGE */}

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

                    {/* NAME */}

                    <div className="room-type-name">

                      {roomType.name}

                    </div>

                    {/* STATUS */}

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

                    {/* ACTIONS */}

                    <div className="room-type-actions">

                      <button
                        className="action-btn"
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

        {/* ========================================== */}
        {/* FOOTER */}
        {/* ========================================== */}

        <div className="room-types-footer">

          <button
            className="pagination-btn"
            disabled={
              !roomTypePagination?.previous
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
              !roomTypePagination?.next
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

      {/* ========================================== */}
      {/* CREATE MODAL */}
      {/* ========================================== */}

      <CreateRoomTypeModal
        isOpen={openCreateModal}
        onClose={() =>
          setOpenCreateModal(false)
        }
      />

      {/* ========================================== */}
      {/* EDIT MODAL */}
      {/* ========================================== */}

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