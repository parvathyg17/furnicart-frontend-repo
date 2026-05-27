import api from "../../services/api";

export const adminLoginAPI = async (data) => {
  const res = await api.post("admin/login/", data);
  return res.data;
};


export const adminMeAPI = async () => {
  const res = await api.get("admin/me/");
  return res.data;
};


export const getUsersAPI = async (page = 1, search = "") => {
  const res = await api.get(
    `admin/users/?page=${page}&search=${search}`
  );
  return res.data;
};


export const getDashboardStatsAPI =
  async () => {

    const res = await api.get(
      "admin/dashboard-stats/"
    );

    return res.data;
};


export const toggleUserBlockAPI = async (userId) => {
  const res = await api.patch(
    `admin/users/${userId}/block/`
  );
  return res.data;
};


export const adminLogoutAPI = async () => {
  const res = await api.post("admin/logout/");
  return res.data;
};