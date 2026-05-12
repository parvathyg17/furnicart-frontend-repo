// ===============================
// AdminUsers.jsx (FIXED)
// ===============================

import "../../styles/adminpanel.css";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Search, ShieldAlert } from "lucide-react";

import {
  getUsers,
  toggleUserBlock,
} from "../../features/admin/adminSlice";

export default function AdminUsers() {
  const dispatch = useDispatch();

  const { users, totalPages, loading } = useSelector(
    (state) => state.admin
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // =========================
  // LOAD USERS
  // =========================
  useEffect(() => {
    dispatch(getUsers({ page, search }));
  }, [dispatch, page]);

  // =========================
  // SEARCH
  // =========================
  const handleSearch = () => {
    setPage(1);
    dispatch(getUsers({ page: 1, search }));
  };

  // =========================
  // MODAL
  // =========================
  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // =========================
  // BLOCK / UNBLOCK
  // =========================
  const confirmAction = async () => {
    if (!selectedUser) return;

    setActionLoading(true);

    const res = await dispatch(toggleUserBlock(selectedUser.id));

    setActionLoading(false);

    if (res.error) {
      toast.error(
        res.payload?.error ||
          res.payload?.detail ||
          "Something went wrong"
      );
      return;
    }

    toast.success(
      selectedUser.status === "blocked"
        ? "User unblocked successfully"
        : "User blocked successfully"
    );

    closeModal();

    dispatch(getUsers({ page, search }));
  };

  // =========================
  // STATUS UI HELPERS
  // =========================
  const getStatusLabel = (status) => {
    if (status === "active") return "Active";
    if (status === "blocked") return "Blocked";
    if (status === "unverified") return "Unverified";
    return "Unknown";
  };

  return (
    <div className="users-page">
      {/* HEADER */}
      <div className="users-top">
        <div>
          <span>USER MANAGEMENT</span>
          <h2>Manage Users</h2>
        </div>

        <div className="users-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Username</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading-cell">
                  Loading...
                </td>
              </tr>
            ) : (
              users?.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>

                  {/* ========================= */}
                  {/* STATUS FIXED HERE */}
                  {/* ========================= */}
                  <td>
                    <span className={`status ${user.status}`}>
                      {getStatusLabel(user.status)}
                    </span>
                  </td>

                  {/* ========================= */}
                  {/* ACTION BUTTON FIXED */}
                  {/* ========================= */}
                  <td>
                    <button
                      className={
                        user.status === "blocked"
                          ? "unblock-btn"
                          : "block-btn"
                      }
                      onClick={() => openModal(user)}
                    >
                      {user.status === "blocked" ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-icon">
              <ShieldAlert size={30} />
            </div>

            <h3>
              {selectedUser?.status === "blocked"
                ? "Unblock User"
                : "Block User"}
            </h3>

            <p>
              Are you sure you want to{" "}
              <strong>
                {selectedUser?.status === "blocked"
                  ? "unblock"
                  : "block"}
              </strong>{" "}
              {selectedUser?.email}?
            </p>

            <div className="admin-modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                className={
                  selectedUser?.status === "blocked"
                    ? "modal-unblock-btn"
                    : "modal-block-btn"
                }
                onClick={confirmAction}
              >
                {actionLoading
                  ? "Please wait..."
                  : selectedUser?.status === "blocked"
                  ? "Unblock User"
                  : "Block User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}