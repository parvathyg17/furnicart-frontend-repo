import "../styles/adminpanel.css";

import {
  LayoutDashboard,
  Users,
  LogOut,
  ShieldAlert,
  FolderKanban,
  Sofa,
  Package2,
  ClipboardList,
  RotateCcw,
  Warehouse,
  Star,
  Tag,
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

const ICON_PROPS = {
  size: 20,
  strokeWidth: 1.75,
  ariaHidden: true,
};

const NAV_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    items: [
      {
        to: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        match: (
          pathname,
        ) =>
          pathname.includes(
            "/admin/dashboard",
          ),
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      {
        to: "/admin/users",
        label: "Users",
        icon: Users,
        match: (
          pathname,
        ) =>
          pathname.includes(
            "/admin/users",
          ),
      },
      {
        to: "/admin/orders",
        label: "Orders",
        icon: ClipboardList,
        match: (
          pathname,
        ) =>
          pathname.startsWith(
            "/admin/orders",
          ) &&
          !pathname.includes(
            "/admin/orders/returns",
          ),
      },
      {
        to: "/admin/orders/returns",
        label: "Returns",
        icon: RotateCcw,
        match: (
          pathname,
        ) =>
          pathname.includes(
            "/admin/orders/returns",
          ),
      },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      {
        to: "/admin/categories",
        label: "Categories",
        icon: FolderKanban,
        match: (
          pathname,
        ) =>
          pathname.includes(
            "/admin/categories",
          ),
      },
      {
        to: "/admin/room-types",
        label: "Room types",
        icon: Sofa,
        match: (
          pathname,
        ) =>
          pathname.includes(
            "/admin/room-types",
          ),
      },
      {
        to: "/admin/reviews",
        label: "Reviews",
        icon: Star,
        match: (
          pathname,
        ) =>
          pathname.includes(
            "/admin/reviews",
          ),
      },
      {
        to: "/admin/coupons",
        label: "Coupons",
        icon: Tag,
        match: (
          pathname,
        ) =>
          pathname.includes(
            "/admin/coupons",
          ),
      },
      {
        to: "/admin/products",
        label: "Products",
        icon: Package2,
        match: (
          pathname,
        ) =>
          pathname.includes(
            "/admin/products",
          ),
      },
      {
        to: "/admin/inventory",
        label: "Inventory",
        icon: Warehouse,
        match: (
          pathname,
        ) =>
          pathname.includes(
            "/admin/inventory",
          ),
      },
    ],
  },
];

export default function AdminLayout() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const location = useLocation();

  const { admin } = useSelector(
    (state) => state.admin,
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
        adminLogout(),
      );

      setLogoutLoading(false);

      navigate(
        "/admin/login",
      );
    };

  const pathname = location.pathname;

  return (

    <div className="admin-layout">

      <aside className="admin-sidebar">

        <div className="admin-sidebar-scroll">

          <div className="admin-sidebar-brand">

            <div className="admin-sidebar-brand-mark" aria-hidden>
              FC
            </div>

            <div className="admin-sidebar-brand-text">

              <h2 className="admin-sidebar-title">
                FurniCart
              </h2>

              <span className="admin-sidebar-tagline">
                Admin
              </span>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Admin navigation">

            {
              NAV_SECTIONS.map(
                (
                  section,
                ) => (

                  <div
                    key={section.id}
                    className="admin-nav-section"
                  >

                    <div className="admin-nav-section-label">
                      {section.label}
                    </div>

                    <ul className="admin-nav-list">

                      {
                        section.items.map(
                          (
                            item,
                          ) => {

                            const Icon = item.icon;

                            const active = item.match(
                              pathname,
                            );

                            return (

                              <li key={item.to}>

                                <Link
                                  to={item.to}
                                  className={
                                    active
                                      ? "admin-nav-link active"
                                      : "admin-nav-link"
                                  }
                                >

                                  <span className="admin-nav-icon-wrap">

                                    <Icon {...ICON_PROPS} />
                                  </span>

                                  <span className="admin-nav-label">
                                    {item.label}
                                  </span>
                                </Link>
                              </li>
                            );
                          },
                        )
                      }
                    </ul>
                  </div>
                ),
              )
            }
          </nav>
        </div>

        <div className="admin-sidebar-footer">

          <button
            type="button"
            className="admin-logout-btn"
            onClick={() =>
              setShowLogoutModal(
                true,
              )
            }
          >

            <span className="admin-nav-icon-wrap admin-nav-icon-wrap--btn">

              <LogOut size={20} strokeWidth={1.75} aria-hidden />
            </span>

            <span>
              Log out
            </span>
          </button>
        </div>
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
              Manage catalog, orders, returns, and customers from one place.
            </p>
          </div>

          <div className="admin-profile">

            <div className="admin-avatar">

              {
                admin?.email?.charAt(
                  0,
                )
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

          <main className="admin-page">

            <Outlet />
          </main>
        </div>
      </div>

      {
        showLogoutModal && (

          <div className="admin-modal-overlay">

            <div className="admin-modal">

              <div className="admin-modal-icon">

                <ShieldAlert size={30} />
              </div>

              <h3>
                Log out
              </h3>

              <p>
                Are you sure you want to leave the admin panel?
              </p>

              <div className="admin-modal-actions">

                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() =>
                    setShowLogoutModal(
                      false,
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="modal-block-btn"
                  onClick={handleLogout}
                >
                  {
                    logoutLoading
                      ? "Logging out…"
                      : "Log out"
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
