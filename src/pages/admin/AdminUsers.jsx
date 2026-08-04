import "../../styles/adminproducts.css";

import { useCallback, useEffect, useState, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";

import toast from "react-hot-toast";

import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { getUsers, toggleUserBlock } from "../../features/admin/adminSlice";

import { useBackgroundServerSync } from "../../hooks/useBackgroundServerSync.js";

import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function AdminUsers() {
  const dispatch = useDispatch();

  const { users, totalPages } = useSelector((state) => state.admin);

  const [loadingLocal, setLoadingLocal] = useState(false);

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [ordering, setOrdering] = useState("-date_joined");

  const [showModal, setShowModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsersList = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoadingLocal(true);
      }

      try {
        await dispatch(
          getUsers({
            page,
            search,
            ordering,
          }),
        ).unwrap();
      } catch (err) {
        if (!silent) {
          toast.error(err?.error || "Failed to load users");
        }
      } finally {
        if (!silent) {
          setLoadingLocal(false);
        }
      }
    },

    [dispatch, page, search, ordering],
  );

  useEffect(() => {
    fetchUsersList();
  }, [fetchUsersList]);

  useBackgroundServerSync({
    enabled: true,

    pollIntervalMs: 120_000,

    onRefresh: () =>
      fetchUsersList({
        silent: true,
      }),
  });

  const openModal = (user) => {
    setSelectedUser(user);

    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);

    setShowModal(false);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      await dispatch(toggleUserBlock(selectedUser.id)).unwrap();

      toast.success(
        selectedUser.status === "blocked" ? "User unblocked" : "User blocked",
      );

      closeModal();
    } catch (err) {
      toast.error(err?.error || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    if (status === "active") {
      return "Active";
    }

    if (status === "blocked") {
      return "Blocked";
    }

    return "Unverified";
  };

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  return (
    <div className="admin-products-page">
      {/* HEADER SECTION */}
      <div className="products-header-top">
        <div className="products-breadcrumb">
          <span>ADMINISTRATION</span>
          <ChevronRight size={12} color="#9ca3af" style={{ margin: "0 4px" }} />
          <span>USERS</span>
        </div>
        <div className="products-header-title-row">
          <h1>User Management</h1>
        </div>
      </div>

      {/* FILTERS CARD */}
      <div className="products-filters-card">
        <div className="filter-group">
          <label>SEARCH</label>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className="filter-group" style={{ maxWidth: "300px" }}>
          <label>SORT BY</label>
          <select
            value={ordering}
            onChange={(e) => {
              setPage(1);
              setOrdering(e.target.value);
            }}
          >
            <option value="-date_joined">Newest Users</option>
            <option value="date_joined">Oldest Users</option>
            <option value="username">Username (A - Z)</option>
            <option value="-username">Username (Z - A)</option>
          </select>
        </div>

        <button
          className="clear-filters-btn"
          onClick={() => {
            setSearch("");
            setOrdering("-date_joined");
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
          style={{ gridTemplateColumns: "100px 2.5fr 2fr 1.5fr 1.5fr" }}
        >
          <span>USER ID</span>
          <span>EMAIL</span>
          <span>USERNAME</span>
          <span>STATUS</span>
          <span style={{ textAlign: "right" }}>ACTIONS</span>
        </div>

        {loadingLocal ? (
          <div className="empty-products">Loading users...</div>
        ) : users?.length > 0 ? (
          <div>
            {users.map((user) => (
              <div
                key={user.id}
                className="products-table-row"
                style={{
                  gridTemplateColumns: "100px 2.5fr 2fr 1.5fr 1.5fr",
                  alignItems: "center",
                }}
              >
                {/* ID Column */}
                <div
                  className="col-created"
                  style={{ fontSize: "14px", fontWeight: "600" }}
                >
                  #{user.id}
                </div>

                {/* Email Column */}
                <div className="product-info-text">
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "16px",
                      textTransform: "none",
                      fontFamily: "inherit",
                    }}
                  >
                    {user.email}
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px" }}>
                    Joined:{" "}
                    {new Date(user.date_joined).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Username Column */}
                <div className="col-room" style={{ fontSize: "14px" }}>
                  <strong>{user.username}</strong>
                </div>

                {/* Status Column */}
                <div>
                  <span
                    className={
                      user.status === "active"
                        ? "status-pill active"
                        : user.status === "blocked"
                          ? "status-pill"
                          : "status-pill"
                    }
                    style={{
                      backgroundColor:
                        user.status === "active"
                          ? "#ecfdf5"
                          : user.status === "blocked"
                            ? "#fee2e2"
                            : "#fef3c7",
                      color:
                        user.status === "active"
                          ? "#065f46"
                          : user.status === "blocked"
                            ? "#991b1b"
                            : "#92400e",
                    }}
                  >
                    <span className="status-dot"></span>
                    {getStatusLabel(user.status)}
                  </span>
                </div>

                {/* Actions Column */}
                <div
                  className="col-controls"
                  style={{ justifyContent: "flex-end" }}
                >
                  <button
                    className="view-details-btn"
                    onClick={() => openModal(user)}
                    style={{
                      padding: "6px 12px",
                      borderColor:
                        user.status === "blocked" ? "#bbf7d0" : "#fecaca",
                      color: user.status === "blocked" ? "#16a34a" : "#ef4444",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {user.status === "blocked" ? "Unblock" : "Block"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-products">No users found.</div>
        )}
      </div>

      {/* FOOTER */}
      {users?.length > 0 && (
        <div className="products-footer">
          <p>
            Showing <strong>{users.length}</strong> users
          </p>
          <div className="pagination">
            <button
              disabled={page === 1 || loadingLocal}
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
              disabled={page === totalPages || loadingLocal}
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

      {/* CONFIRM ACTION DIALOG */}
      <ConfirmDialog
        open={showModal}
        titleId="confirm-block-user-title"
        title={
          selectedUser?.status === "blocked" ? "Unblock User" : "Block User"
        }
        hint={`Are you sure you want to ${
          selectedUser?.status === "blocked" ? "unblock" : "block"
        } ${selectedUser?.email}?`}
        confirmLabel={selectedUser?.status === "blocked" ? "Unblock" : "Block"}
        cancelLabel="Cancel"
        onConfirm={confirmAction}
        onCancel={closeModal}
        busy={actionLoading}
      />
    </div>
  );
}
