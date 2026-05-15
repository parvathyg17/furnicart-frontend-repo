import api from "../../services/api";

// ADMIN LOGIN
export const adminLoginAPI = async (data) => {
  const res = await api.post("admin/login/", data);
  return res.data;
};

// ADMIN ME
export const adminMeAPI = async () => {
  const res = await api.get("admin/me/");
  return res.data;
};

// GET USERS (search + pagination)
export const getUsersAPI = async (page = 1, search = "") => {
  const res = await api.get(
    `admin/users/?page=${page}&search=${search}`
  );
  return res.data;
};

// DASHBOARD STATS
export const getDashboardStatsAPI =
  async () => {

    const res = await api.get(
      "admin/dashboard-stats/"
    );

    return res.data;
};

// BLOCK / UNBLOCK USER
export const toggleUserBlockAPI = async (userId) => {
  const res = await api.patch(
    `admin/users/${userId}/block/`
  );
  return res.data;
};

// ADMIN LOGOUT
export const adminLogoutAPI = async () => {
  const res = await api.post("admin/logout/");
  return res.data;
};