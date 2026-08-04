import api from "../../services/api";

export async function fetchAdminReferralProgram() {
  const res = await api.get("admin/referral-program/");

  return res.data;
}

export async function postAdminReferralProgram(body) {
  const res = await api.post("admin/referral-program/", body);

  return res.data;
}

export async function patchAdminReferralProgram(body) {
  const res = await api.patch("admin/referral-program/", body);

  return res.data;
}
