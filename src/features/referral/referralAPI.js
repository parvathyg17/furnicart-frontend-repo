import api from "../../services/api";

const REFERRAL_TOKEN_KEY = "referral_token";
const REFERRAL_CODE_KEY = "referral_code";

export function captureReferralFromSearch(
  search,
) {

  const params = new URLSearchParams(
    search || "",
  );

  const ref = params.get(
    "ref",
  );

  if (ref) {

    sessionStorage.setItem(
      REFERRAL_TOKEN_KEY,
      ref.trim(),
    );
  }
}

export function setStoredReferralCode(
  code,
) {

  const clean = String(
    code || "",
  ).trim();

  if (clean) {

    sessionStorage.setItem(
      REFERRAL_CODE_KEY,
      clean,
    );

    return;
  }

  sessionStorage.removeItem(
    REFERRAL_CODE_KEY,
  );
}

export function getStoredReferralPayload() {

  return {
    referral_token:
      sessionStorage.getItem(
        REFERRAL_TOKEN_KEY,
      ) || "",
    referral_code:
      sessionStorage.getItem(
        REFERRAL_CODE_KEY,
      ) || "",
  };
}

export function clearStoredReferral() {

  sessionStorage.removeItem(
    REFERRAL_TOKEN_KEY,
  );

  sessionStorage.removeItem(
    REFERRAL_CODE_KEY,
  );
}

export async function fetchReferralMe() {

  const response = await api.get(
    "promotions/referral/me/",
  );

  return response.data;
}
