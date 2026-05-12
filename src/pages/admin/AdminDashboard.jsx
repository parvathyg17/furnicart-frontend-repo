

import "../../styles/adminpanel.css";

import {
  Users,
  UserCheck,
  UserX,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  getUsers,
} from "../../features/admin/adminSlice";

export default function AdminDashboard() {

  const dispatch = useDispatch();

  const { users } =
    useSelector(
      (state) => state.admin
    );

  useEffect(() => {

    dispatch(
      getUsers({
        page: 1,
        search: "",
      })
    );

  }, [dispatch]);

  const totalUsers =
    users?.length || 0;

  const activeUsers =
    users?.filter(
      (u) => u.is_active
    ).length || 0;

  const blockedUsers =
    totalUsers - activeUsers;

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
              {totalUsers}
            </h2>

          </div>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-icon green">
            <UserCheck size={28} />
          </div>

          <div>

            <h4>
              Active Users
            </h4>

            <h2>
              {activeUsers}
            </h2>

          </div>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-icon red">
            <UserX size={28} />
          </div>

          <div>

            <h4>
              Blocked Users
            </h4>

            <h2>
              {blockedUsers}
            </h2>

          </div>

        </div>

      </div>

    </div>
  );
}