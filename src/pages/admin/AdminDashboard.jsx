import "../../styles/adminpanel.css";

import {
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  getDashboardStatsAPI,
} from "../../features/admin/adminAPI";


export default function AdminDashboard() {

  // ==========================================
  // LOCAL STATE
  // ==========================================

  const [
    loadingLocal,
    setLoadingLocal,
  ] = useState(false);

  const [stats, setStats] =
    useState({

      total_users: 0,

      active_users: 0,

      blocked_users: 0,
    });


  // ==========================================
  // FETCH DASHBOARD STATS
  // ==========================================

  useEffect(() => {

    const fetchStats =
      async () => {

        try {

          setLoadingLocal(true);

          const data =
            await getDashboardStatsAPI();

          setStats(data);

        } catch (err) {

          toast.error(
            "Failed to load dashboard"
          );

        } finally {

          setLoadingLocal(false);

        }
      };

    fetchStats();

  }, []);


  // ==========================================
  // LOADING
  // ==========================================

  if (loadingLocal) {

    return (
      <div className="loading-cell">
        Loading dashboard...
      </div>
    );
  }


  return (

    <div>

      {/* HEADER */}
      <div className="dashboard-header">

        <div>

          <span>
            OVERVIEW
          </span>

          <h2>
            Dashboard Analytics
          </h2>

        </div>

      </div>


      {/* CARDS */}
      <div className="dashboard-cards">

        {/* TOTAL USERS */}
        <div className="dashboard-card">

          <div className="dashboard-icon">

            <Users size={28} />

          </div>

          <div>

            <h4>
              Total Users
            </h4>

            <h2>
              {stats.total_users}
            </h2>

          </div>

        </div>


        {/* ACTIVE USERS */}
        <div className="dashboard-card">

          <div className="dashboard-icon green">

            <UserCheck size={28} />

          </div>

          <div>

            <h4>
              Active Users
            </h4>

            <h2>
              {stats.active_users}
            </h2>

          </div>

        </div>


        {/* BLOCKED USERS */}
        <div className="dashboard-card">

          <div className="dashboard-icon red">

            <UserX size={28} />

          </div>

          <div>

            <h4>
              Blocked Users
            </h4>

            <h2>
              {stats.blocked_users}
            </h2>

          </div>

        </div>

      </div>

    </div>
  );
}