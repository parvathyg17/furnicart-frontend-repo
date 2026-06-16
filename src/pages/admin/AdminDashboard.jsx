import "../../styles/adminpanel.css";

import {
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  getDashboardStatsAPI,
} from "../../features/admin/adminAPI";

import {
  useBackgroundServerSync,
} from "../../hooks/useBackgroundServerSync.js";

import {
  stableStringify,
} from "../../utils/stableStringify.js";

export default function AdminDashboard() {

  

  const [
    loadingLocal,
    setLoadingLocal,
  ] = useState(false);

  const [stats, setStats] =
    useState({

      total_users: 0,

      active_users: 0,

      blocked_users: 0,

      // order_status: {
      //   order_pending_count: 0,
      // },
    });



  const lastStatsSigRef =
    useRef(
      null,
    );

  const loadStats =
    useCallback(
      async (
        { silent = false } = {},
      ) => {

        if (!silent) {

          setLoadingLocal(
            true,
          );
        }

        try {

          const data =
            await getDashboardStatsAPI();

          const snap =
            stableStringify(
              data,
            );

          if (
            silent &&
            lastStatsSigRef.current ===
              snap
          ) {

            return;
          }

          lastStatsSigRef.current =
            snap;

          setStats(
            data,
          );
        } catch (err) {

          if (!silent) {

            toast.error(
              "Failed to load dashboard"
            );
          }
        } finally {

          if (!silent) {

            setLoadingLocal(
              false,
            );
          }
        }
      },

      [],
    );

  useEffect(
    () => {

      loadStats();
    },
    [loadStats],
  );

  useBackgroundServerSync(
    {

      enabled: true,

      pollIntervalMs: 120_000,

      onRefresh:
        () =>
          loadStats(
            {
              silent: true,
            },
          ),
    },
  );



  if (loadingLocal) {

    return (
      <div className="loading-cell">
        Loading dashboard...
      </div>
    );
  }

  return (

    <div>

  
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

  
      <div className="dashboard-cards">

     
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
        {/* //sample

        <div className="dashboard-card">

          <div className="dashboard-icon green">

            <UserCheck size={28} />

          </div>

          <div>

            <h4>
              Pending Product
            </h4>

            <h2>
              {stats.order_status.order_pending_count}
            </h2>

          </div>

        </div> */}

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