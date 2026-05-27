import "../styles/adminpanel.css";

import {
  LayoutDashboard,
  Users,
  LogOut,
  ShieldAlert,
  FolderKanban,
  Sofa,
  Package2,
} from "lucide-react";

import {
  Link,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useState,
} from "react";

import {
  adminLogout,
} from "../features/admin/adminSlice";

export default function AdminLayout() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const { admin } = useSelector(
    (state) => state.admin
  );

  const [
    showLogoutModal,
    setShowLogoutModal,
  ] = useState(false);

  const [
    logoutLoading,
    setLogoutLoading,
  ] = useState(false);

 

  const handleLogout =
    async () => {

      setLogoutLoading(true);

      await dispatch(
        adminLogout()
      );

      setLogoutLoading(false);

      navigate(
        "/admin/login"
      );
    };

  return (

    <div className="admin-layout">

      
      <aside className="admin-sidebar">

        <div>

          

          <div className="admin-sidebar-logo">

            <h2>
              FURNICART
            </h2>

            <span>
              ADMIN PANEL
            </span>

          </div>

          

          <nav className="admin-nav">

            

            <Link
              to="/admin/dashboard"
              className={
                location.pathname.includes(
                  "/admin/dashboard"
                )

                  ? "admin-nav-link active"

                  : "admin-nav-link"
              }
            >

              <LayoutDashboard size={20} />

              Dashboard

            </Link>

            

            <Link
              to="/admin/users"
              className={
                location.pathname.includes(
                  "/admin/users"
                )

                  ? "admin-nav-link active"

                  : "admin-nav-link"
              }
            >

              <Users size={20} />

              Users

            </Link>

            

            <Link
              to="/admin/categories"
              className={
                location.pathname.includes(
                  "/admin/categories"
                )

                  ? "admin-nav-link active"

                  : "admin-nav-link"
              }
            >

              <FolderKanban size={20} />

              Categories

            </Link>

            

            <Link
              to="/admin/room-types"
              className={
                location.pathname.includes(
                  "/admin/room-types"
                )

                  ? "admin-nav-link active"

                  : "admin-nav-link"
              }
            >

              <Sofa size={20} />

              Room Types

            </Link>

            

            <Link
              to="/admin/products"
              className={
                location.pathname.includes(
                  "/admin/products"
                )

                  ? "admin-nav-link active"

                  : "admin-nav-link"
              }
            >

              <Package2 size={20} />

              Products

            </Link>

          </nav>

        </div>

        

        <button
          className="admin-logout-btn"
          onClick={() =>
            setShowLogoutModal(true)
          }
        >

          <LogOut size={18} />

          Logout

        </button>

      </aside>

      

      <div className="admin-main">

        

        <header className="admin-topbar">

          <div>

            <h1>

              Welcome back,
              {" "}
              {admin?.username}

            </h1>

            <p>

              Manage products,
              categories,
              room types,
              and customers.

            </p>

          </div>

         

          <div className="admin-profile">

            <div className="admin-avatar">

              {
                admin?.email?.charAt(0)
              }

            </div>

            <div>

              <h4>

                {admin?.email}

              </h4>

              <span>

                Administrator

              </span>

            </div>

          </div>

        </header>

       

        <div className="admin-content">

          <Outlet />

        </div>

      </div>

      

      {showLogoutModal && (

        <div className="admin-modal-overlay">

          <div className="admin-modal">

            <div className="admin-modal-icon">

              <ShieldAlert size={30} />

            </div>

            <h3>

              Logout

            </h3>

            <p>

              Are you sure you want
              to logout from admin panel?

            </p>

            <div className="admin-modal-actions">

              <button
                className="modal-cancel-btn"
                onClick={() =>
                  setShowLogoutModal(false)
                }
              >

                Cancel

              </button>

              <button
                className="modal-block-btn"
                onClick={handleLogout}
              >

                {
                  logoutLoading

                    ? "Logging out..."

                    : "Logout"
                }

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}