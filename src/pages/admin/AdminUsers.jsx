import "../../styles/adminusers.css";

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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  getUsers,
  toggleUserBlock,
} from "../../features/admin/adminSlice";

export default function AdminUsers() {

  const dispatch = useDispatch();

  const {
    users,
    totalPages,
  } = useSelector(
    (state) => state.admin
  );

  // ==========================================
  // STATES
  // ==========================================

  const [
    loadingLocal,
    setLoadingLocal,
  ] = useState(false);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    selectedUser,
    setSelectedUser,
  ] = useState(null);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  // ==========================================
  // FETCH USERS
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
  // MODAL
  // ==========================================

  const openModal =
    (user) => {

      setSelectedUser(user);

      setShowModal(true);
    };

  const closeModal =
    () => {

      setSelectedUser(null);

      setShowModal(false);
    };

  // ==========================================
  // BLOCK / UNBLOCK
  // ==========================================

  const confirmAction =
    async () => {

      if (!selectedUser)
        return;

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

            ? "User unblocked"

            : "User blocked"
        );

        closeModal();

      } catch (err) {

        toast.error(

          err?.error ||

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

      return "Unverified";
    };

  return (

    <div className="admin-users-page">

      {/* HEADER */}

      <div className="users-header">

        <div>

          <div className="users-breadcrumb">

            Administration

            <span>/</span>

            Users

          </div>

          <h1>

            User Management

          </h1>

        </div>

      </div>

      {/* CARD */}

      <div className="users-card">

        {/* TOOLBAR */}

        <div className="users-toolbar">

          <div className="users-search-box">

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

          </div>

        </div>

        {/* TABLE */}

        <div className="users-table-wrapper">

          <div className="users-table-header">

            <div>ID</div>

            <div>Email</div>

            <div>Username</div>

            <div>Status</div>

            <div>Actions</div>

          </div>

          {
            loadingLocal ? (

              <div className="users-empty">

                Loading users...

              </div>

            ) : users?.length > 0 ? (

              users.map((user) => (

                <div
                  key={user.id}
                  className="users-row"
                >

                  <div>

                    #{user.id}

                  </div>

                  <div className="user-email">

                    {user.email}

                  </div>

                  <div>

                    {user.username}

                  </div>

                  <div>

                    <span
                      className={
                        user.status ===
                        "active"

                          ? "user-status active"

                          : user.status ===
                            "blocked"

                          ? "user-status blocked"

                          : "user-status unverified"
                      }
                    >

                      {
                        getStatusLabel(
                          user.status
                        )
                      }

                    </span>

                  </div>

                  <div>

                    <button
                      className={
                        user.status ===
                        "blocked"

                          ? "user-action-btn unblock"

                          : "user-action-btn block"
                      }
                      onClick={() =>
                        openModal(user)
                      }
                    >

                      {
                        user.status ===
                        "blocked"

                          ? "Unblock"

                          : "Block"
                      }

                    </button>

                  </div>

                </div>
              ))

            ) : (

              <div className="users-empty">

                No users found

              </div>

            )
          }

        </div>

        {/* FOOTER */}

        <div className="users-footer">

          <p>

            Showing{" "}

            {users?.length || 0}

            {" "}users

          </p>

          <div className="users-pagination">

            <button
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  (prev) =>
                    prev - 1
                )
              }
            >

              <ChevronLeft size={18} />

              Prev

            </button>

            <div className="page-indicator">

              Page {page} of {totalPages}

            </div>

            <button
              disabled={
                page >= totalPages
              }
              onClick={() =>
                setPage(
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

      {/* MODAL */}

      {
        showModal && (

          <div className="admin-modal-overlay">

            <div className="admin-modal">

              <div className="admin-modal-icon">

                <ShieldAlert size={30} />

              </div>

              <h3>

                {
                  selectedUser?.status ===
                  "blocked"

                    ? "Unblock User"

                    : "Block User"
                }

              </h3>

              <p>

                Are you sure you want to{" "}

                <strong>

                  {
                    selectedUser?.status ===
                    "blocked"

                      ? "unblock"

                      : "block"
                  }

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
                    selectedUser?.status ===
                    "blocked"

                      ? "modal-unblock-btn"

                      : "modal-block-btn"
                  }
                  onClick={confirmAction}
                >

                  {
                    actionLoading

                      ? "Please wait..."

                      : selectedUser?.status ===
                        "blocked"

                      ? "Unblock User"

                      : "Block User"
                  }

                </button>

              </div>

            </div>

          </div>
        )
      }

    </div>
  );
}