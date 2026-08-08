import "../../../styles/adminproducts.css";

import CreateRoomTypeModal from "./CreateRoomTypeModal";

import EditRoomTypeModal from "./EditRoomTypeModal";

import { useEffect, useState, useCallback, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

import {
  getAdminRoomTypes,
  deleteRoomType,
  restoreRoomType,
  clearRoomTypeMessages,
} from "../../../features/catalog/roomtype/roomTypeSlice";

import { useBackgroundServerSync } from "../../../hooks/useBackgroundServerSync.js";

import ConfirmDialog from "../../../components/common/ConfirmDialog";

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
  } = useSelector((state) => state.roomType);

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("true");

  const [sort, setSort] = useState("latest");

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [openEditModal, setOpenEditModal] = useState(false);

  const [selectedRoomType, setSelectedRoomType] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);

  const [confirmText, setConfirmText] = useState("");

  const totalPages = roomTypePagination?.totalPages ?? 0;

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  useEffect(() => {
    if (roomTypeSuccess) {
      toast.success(roomTypeSuccess);

      const timer = setTimeout(() => {
        dispatch(clearRoomTypeMessages());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [roomTypeSuccess, dispatch]);

  useEffect(() => {
    if (roomTypeError) {
      toast.error(roomTypeError);

      const timer = setTimeout(() => {
        dispatch(clearRoomTypeMessages());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [roomTypeError, dispatch]);

  useEffect(() => {
    if (!roomTypeListLoading && page > (roomTypePagination?.totalPages || 1)) {
      setPage(roomTypePagination?.totalPages || 1);
    }
  }, [page, roomTypePagination, roomTypeListLoading]);

  const fetchRoomTypes = useCallback(
    (targetPage = page) => {
      const params = {
        page: targetPage,

        search,

        sort,
      };

      if (statusFilter !== "all") {
        params.is_active = statusFilter;
      }

      dispatch(getAdminRoomTypes(params));
    },

    [dispatch, page, search, statusFilter, sort],
  );

  useEffect(() => {
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  useBackgroundServerSync({
    enabled: true,

    pollIntervalMs: 120_000,

    onRefresh: fetchRoomTypes,
  });

  const handleDelete = (roomTypeId) => {
    setConfirmText("Are you sure you want to delete this room type?");
    setConfirmAction(() => async () => {
      const result = await dispatch(deleteRoomType(roomTypeId));

      if (!deleteRoomType.fulfilled.match(result)) {
        return;
      }

      if (roomTypes.length === 1 && page > 1) {
        setPage((prev) => prev - 1);

        return;
      }

      fetchRoomTypes(page);
    });
    setShowConfirmModal(true);
  };

  const handleRestore = (roomTypeId) => {
    setConfirmText("Are you sure you want to restore this room type?");
    setConfirmAction(() => async () => {
      const result = await dispatch(restoreRoomType(roomTypeId));

      if (!restoreRoomType.fulfilled.match(result)) {
        return;
      }

      if (roomTypes.length === 1 && page > 1) {
        setPage((prev) => prev - 1);

        return;
      }

      fetchRoomTypes(page);
    });
    setShowConfirmModal(true);
  };

  const handleCreateSuccess = () => {
    if (page !== 1) {
      setPage(1);
    } else {
      fetchRoomTypes(1);
    }
  };

  const handleEditSuccess = () => {
    fetchRoomTypes(page);
  };

  const handleEdit = (roomType) => {
    setSelectedRoomType(roomType);

    setOpenEditModal(true);
  };

  return (
    <div className="admin-products-page">
      {/* HEADER SECTION */}
      <div className="products-header-top">
        <div className="products-breadcrumb">
          <span>CATALOG</span>
          <ChevronRight size={12} color="#9ca3af" />
          <span>ROOM TYPES</span>
        </div>
        <div className="products-header-title-row">
          <h1>Room Types</h1>
          <button
            className="new-product-btn"
            onClick={() => setOpenCreateModal(true)}
          >
            <Plus size={18} /> Create Room Type
          </button>
        </div>
      </div>

      {/* STATUS TABS */}
      <div className="status-tabs-container">
        <button
          className={
            statusFilter === "all" ? "status-tab active" : "status-tab"
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
            statusFilter === "true" ? "status-tab active" : "status-tab"
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
            statusFilter === "false" ? "status-tab active" : "status-tab"
          }
          onClick={() => {
            setPage(1);
            setStatusFilter("false");
          }}
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
            placeholder="Search room types by name..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className="filter-group" style={{ maxWidth: "240px" }}>
          <label>SORT BY</label>
          <select
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
          >
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
            setStatusFilter("all");
            setPage(1);
          }}
        >
          Clear
        </button>
      </div>

      {/* TABLE AREA */}
      <div className="products-table-container">
        <div
          className="products-table-header"
          style={{ gridTemplateColumns: "100px 2fr 1.5fr 1.5fr" }}
        >
          <span>IMAGE</span>
          <span>NAME</span>
          <span>STATUS</span>
          <span style={{ textAlign: "right" }}>ACTIONS</span>
        </div>

        {roomTypeListLoading ? (
          <div className="empty-products">Loading room types...</div>
        ) : roomTypes?.length > 0 ? (
          <div>
            {roomTypes.map((roomType) => (
              <div
                key={roomType.id}
                className="products-table-row"
                style={{
                  gridTemplateColumns: "100px 2fr 1.5fr 1.5fr",
                  alignItems: "center",
                }}
              >
                {/* Image Column */}
                <div className="col-details">
                  <img
                    src={roomType.image || "https://placehold.co/80x80"}
                    alt={roomType.name}
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
                    {roomType.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px" }}>
                    /{roomType.slug}
                  </p>
                </div>

                {/* Status Column */}
                <div>
                  <span
                    className={
                      roomType.is_active ? "status-pill active" : "status-pill"
                    }
                  >
                    <span className="status-dot"></span>
                    {roomType.is_active ? "ACTIVE" : "DELETED"}
                  </span>
                </div>

                {/* Actions Column */}
                <div
                  className="col-controls"
                  style={{ justifyContent: "flex-end", gap: "8px" }}
                >
                  <button
                    className="view-details-btn"
                    disabled={roomTypeUpdateLoading}
                    onClick={() => handleEdit(roomType)}
                    style={{ padding: "6px 10px" }}
                    title="Edit Room Type"
                  >
                    <Pencil size={16} />
                  </button>

                  {roomType.is_active ? (
                    <button
                      className="view-details-btn"
                      disabled={roomTypeDeleteLoading}
                      onClick={() => handleDelete(roomType.id)}
                      style={{
                        padding: "6px 10px",
                        borderColor: "#fecaca",
                        color: "#ef4444",
                      }}
                      title="Delete Room Type"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      className="view-details-btn"
                      disabled={roomTypeRestoreLoading}
                      onClick={() => handleRestore(roomType.id)}
                      style={{
                        padding: "6px 10px",
                        borderColor: "#bbf7d0",
                        color: "#16a34a",
                      }}
                      title="Restore Room Type"
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
          <div className="empty-products">No room types found.</div>
        )}
      </div>

      {/* FOOTER */}
      {roomTypes?.length > 0 && (
        <div className="products-footer">
          <p>
            Showing <strong>{roomTypes.length}</strong> of{" "}
            <strong>{roomTypePagination?.count || 0}</strong> room types
          </p>
          <div className="pagination">
            <button
              disabled={page === 1 || roomTypeListLoading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
                className={page === pNum ? "active" : ""}
                onClick={() => setPage(pNum)}
              >
                {pNum}
              </button>
            ))}
            <button
              disabled={page === totalPages || roomTypeListLoading}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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

      <CreateRoomTypeModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditRoomTypeModal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);

          setSelectedRoomType(null);
        }}
        roomType={selectedRoomType}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        open={showConfirmModal}
        titleId="confirm-room-action-title"
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
        busy={roomTypeDeleteLoading || roomTypeRestoreLoading}
      />
    </div>
  );
}
