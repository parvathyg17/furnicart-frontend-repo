import api from "../../services/api";

export async function submitContactMessage(data) {
  const res = await api.post("contact/", data);
  return res.data;
}

export async function fetchAdminContactMessages({ page = 1, pageSize = 10, search = "" } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  if (search) {
    params.set("search", search);
  }
  const res = await api.get(`admin/contact/?${params.toString()}`);
  return res.data;
}

export async function markMessageRead(messageId) {
  const res = await api.patch(`admin/contact/${messageId}/`, { is_read: true });
  return res.data;
}

export async function deleteContactMessage(messageId) {
  const res = await api.delete(`admin/contact/${messageId}/`);
  return res.data;
}
