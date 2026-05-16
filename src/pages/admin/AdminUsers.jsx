import "../../styles/adminpanel.css";

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
  Search,
  ShieldAlert,
} from "lucide-react";

import {
  getUsers,
  toggleUserBlock,
} from "../../features/admin/adminSlice";

export default function AdminUsers() {

  const dispatch =
    useDispatch();

  const {
    users,
    totalPages,
  } = useSelector(
    (state) => state.admin
  );

  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [
    loadingLocal,
    setLoadingLocal,
  ] = useState(false);

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {

    const fetchUsers =
      async () => {

        try {

          setLoadingLocal(true);

          await dispatch(
            getUsers({
              page,
              search,
            })
          ).unwrap();

        } catch (err) {

          toast.error(

            err?.error ||
            "Failed to load users"

          );

        } finally {

          setLoadingLocal(false);

        }
      };

    fetchUsers();

  }, [
    dispatch,
    page,
    search,
  ]);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch =
    () => {

      setPage(1);

    };

  // ==========================================
  // MODAL
  // ==========================================

  const openModal =
    (user) => {

      setSelectedUser(user);

      setShowModal(true);

    };

  const closeModal =
    () => {

      setShowModal(false);

      setSelectedUser(null);

    };

  // ==========================================
  // BLOCK / UNBLOCK
  // ==========================================

  const confirmAction =
    async () => {

      if (!selectedUser) return;

      try {

        setActionLoading(true);

        await dispatch(
          toggleUserBlock(
            selectedUser.id
          )
        ).unwrap();

        toast.success(

          selectedUser.status ===
          "blocked"

            ? "User unblocked successfully"

            : "User blocked successfully"

        );

        closeModal();

      } catch (err) {

        toast.error(

          err?.error ||

          err?.detail ||

          "Something went wrong"

        );

      } finally {

        setActionLoading(false);

      }
    };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel =
    (status) => {

      if (status === "active") {
        return "Active";
      }

      if (status === "blocked") {
        return "Blocked";
      }

      if (status === "unverified") {
        return "Unverified";
      }

      return "Unknown";
    };

  return (

    <div className="users-page">

      {/* HEADER */}
      <div className="users-top">

        <div>

          <span>
            USER MANAGEMENT
          </span>

          <h2>
            Manage Users
          </h2>

        </div>

        <div className="users-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          <button
            onClick={
              handleSearch
            }
          >
            Search
          </button>

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

            {loadingLocal ? (

              <tr>

                <td
                  colSpan="5"
                  className="loading-cell"
                >
                  Loading...
                </td>

              </tr>

            ) : users?.length === 0 ? (

              <tr>

                <td
                  colSpan="5"
                  className="loading-cell"
                >
                  No users found
                </td>

              </tr>

            ) : (

              users?.map((user) => (

                <tr key={user.id}>

                  <td>
                    #{user.id}
                  </td>

                  <td>
                    {user.email}
                  </td>

                  <td>
                    {user.username}
                  </td>

                  <td>

                    <span
                      className={`status ${user.status}`}
                    >

                      {getStatusLabel(
                        user.status
                      )}

                    </span>

                  </td>

                  <td>

                    <button
                      className={
                        user.status ===
                        "blocked"

                          ? "unblock-btn"

                          : "block-btn"
                      }
                      onClick={() =>
                        openModal(user)
                      }
                    >

                      {user.status ===
                      "blocked"

                        ? "Unblock"

                        : "Block"}

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
          onClick={() =>
            setPage(page - 1)
          }
        >
          Prev
        </button>

        <span>

          Page {page} / {totalPages}

        </span>

        <button
          disabled={
            page >= totalPages
          }
          onClick={() =>
            setPage(page + 1)
          }
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

              {selectedUser?.status ===
              "blocked"

                ? "Unblock User"

                : "Block User"}

            </h3>

            <p>

              Are you sure you want to{" "}

              <strong>

                {selectedUser?.status ===
                "blocked"

                  ? "unblock"

                  : "block"}

              </strong>{" "}

              {selectedUser?.email}?

            </p>

            <div className="admin-modal-actions">

              <button
                className="modal-cancel-btn"
                onClick={
                  closeModal
                }
              >
                Cancel
              </button>

              <button
                className={
                  selectedUser?.status ===
                  "blocked"

                    ? "modal-unblock-btn"

                    : "modal-block-btn"
                }
                onClick={
                  confirmAction
                }
                disabled={
                  actionLoading
                }
              >

                {actionLoading

                  ? "Please wait..."

                  : selectedUser?.status ===
                    "blocked"

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