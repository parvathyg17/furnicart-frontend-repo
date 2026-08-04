import "../../styles/admin-coupons.css";

import { useCallback, useEffect, useState } from "react";

import toast from "react-hot-toast";

import { Gift, Save } from "lucide-react";

import {
  fetchAdminReferralProgram,
  patchAdminReferralProgram,
  postAdminReferralProgram,
} from "../../features/referral/referralProgramAPI";

import { formatProductApiError } from "../../utils/productApiErrors.js";

function emptyFormState() {
  return {
    name: "Default Referral Program",
    is_active: true,
    referee_discount_type: "percent",
    referee_discount_value: "10.00",
    referee_max_discount_amount: "",
    referee_coupon_valid_days: "",
    referrer_reward_amount: "500.00",
  };
}

function programToForm(program) {
  return {
    name: program.name || "",
    is_active: Boolean(program.is_active),
    referee_discount_type: program.referee_discount_type || "percent",
    referee_discount_value: String(program.referee_discount_value ?? ""),
    referee_max_discount_amount:
      program.referee_max_discount_amount != null
        ? String(program.referee_max_discount_amount)
        : "",
    referee_coupon_valid_days:
      program.referee_coupon_valid_days != null
        ? String(program.referee_coupon_valid_days)
        : "",
    referrer_reward_amount: String(program.referrer_reward_amount ?? ""),
  };
}

function buildPayload(form) {
  const maxDiscount = (form.referee_max_discount_amount || "").trim();

  const validDays = (form.referee_coupon_valid_days || "").trim();

  return {
    name: form.name.trim(),
    is_active: form.is_active,
    referee_discount_type: form.referee_discount_type,
    referee_discount_value: form.referee_discount_value,
    referee_max_discount_amount: maxDiscount ? maxDiscount : null,
    referee_coupon_valid_days: validDays ? parseInt(validDays, 10) : null,
    referrer_reward_amount: form.referrer_reward_amount,
  };
}

export default function AdminReferral() {
  const [program, setProgram] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyFormState);

  const [saveBusy, setSaveBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    setError("");

    try {
      const data = await fetchAdminReferralProgram();

      const existing = data.program;

      setProgram(existing);

      if (existing) {
        setForm(programToForm(existing));
      } else {
        setForm(emptyFormState());
      }
    } catch {
      setError("Could not load referral program.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Program name is required.");

      return;
    }

    if (
      form.referee_discount_value === "" ||
      form.referee_discount_value == null
    ) {
      toast.error("Referee discount value is required.");

      return;
    }

    if (
      form.referrer_reward_amount === "" ||
      form.referrer_reward_amount == null
    ) {
      toast.error("Referrer reward amount is required.");

      return;
    }

    setSaveBusy(true);

    try {
      const body = buildPayload(form);

      const data = program
        ? await patchAdminReferralProgram(body)
        : await postAdminReferralProgram(body);

      const saved = data.program;

      setProgram(saved);

      setForm(programToForm(saved));

      toast.success(
        program ? "Referral program updated." : "Referral program created.",
      );
    } catch (err) {
      toast.error(
        formatProductApiError(err.response?.data) ||
          "Could not save referral program.",
      );
    } finally {
      setSaveBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-coupons-page">
        <p className="admin-coupons-muted">Loading referral program...</p>
      </div>
    );
  }

  return (
    <div className="admin-coupons-page">
      <header className="admin-coupons-header">
        <div>
          <h1>Refer & Earn</h1>

          <p>
            Configure the referral program shown on customer profile pages. When
            active, users can share a code and earn wallet credit.
          </p>
        </div>

        <button
          type="button"
          className="admin-coupons-primary"
          onClick={handleSave}
          disabled={saveBusy}
        >
          <Save size={18} />
          {saveBusy ? "Saving..." : program ? "Save changes" : "Create program"}
        </button>
      </header>

      {error && <p className="admin-coupons-error">{error}</p>}

      {!program && !error && (
        <p className="admin-coupons-muted">
          No referral program yet. Fill in the details below and click Create
          program.
        </p>
      )}

      {program && (
        <p className="admin-coupons-muted">
          Status:{" "}
          <span
            className={
              program.is_active
                ? "admin-coupons-badge admin-coupons-badge--on"
                : "admin-coupons-badge admin-coupons-badge--off"
            }
          >
            {program.is_active ? "Active" : "Inactive"}
          </span>{" "}
          — customers only see Refer & Earn when this is active.
        </p>
      )}

      <div
        className="admin-coupons-modal"
        style={{
          maxWidth: "640px",
          marginTop: "1.25rem",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
        }}
      >
        <h2>
          <Gift
            size={22}
            style={{
              verticalAlign: "middle",
              marginRight: "0.4rem",
            }}
          />
          Program settings
        </h2>

        <div className="admin-coupons-field">
          <label htmlFor="referral-name">Program name</label>

          <input
            id="referral-name"
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Default Referral Program"
          />
        </div>

        <div className="admin-coupons-field admin-coupons-field--inline">
          <input
            id="referral-active"
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
          />

          <label htmlFor="referral-active">
            Program active (show on profile pages)
          </label>
        </div>

        <div className="admin-coupons-field">
          <label htmlFor="referrer-reward">
            Referrer reward (₹ wallet credit)
          </label>

          <input
            id="referrer-reward"
            type="number"
            min="0"
            step="0.01"
            value={form.referrer_reward_amount}
            onChange={(e) =>
              updateField("referrer_reward_amount", e.target.value)
            }
            placeholder="500.00"
          />

          <p className="admin-coupons-muted">
            Paid to the referrer after the friend completes their first paid
            order.
          </p>
        </div>

        <div className="admin-coupons-field">
          <label htmlFor="referee-discount-type">
            Referee welcome discount type
          </label>

          <select
            id="referee-discount-type"
            value={form.referee_discount_type}
            onChange={(e) =>
              updateField("referee_discount_type", e.target.value)
            }
          >
            <option value="percent">Percentage off</option>
            <option value="fixed">Fixed amount off (₹)</option>
          </select>
        </div>

        <div className="admin-coupons-field">
          <label htmlFor="referee-discount-value">Referee discount value</label>

          <input
            id="referee-discount-value"
            type="number"
            min="0"
            step="0.01"
            value={form.referee_discount_value}
            onChange={(e) =>
              updateField("referee_discount_value", e.target.value)
            }
            placeholder={
              form.referee_discount_type === "percent" ? "10" : "100"
            }
          />

          <p className="admin-coupons-muted">
            {form.referee_discount_type === "percent"
              ? "Percentage off the referee's first order (0–100)."
              : "Fixed rupee amount off the referee's first order."}
          </p>
        </div>

        {form.referee_discount_type === "percent" && (
          <div className="admin-coupons-field">
            <label htmlFor="referee-max-discount">
              Max discount cap (₹, optional)
            </label>

            <input
              id="referee-max-discount"
              type="number"
              min="0"
              step="0.01"
              value={form.referee_max_discount_amount}
              onChange={(e) =>
                updateField("referee_max_discount_amount", e.target.value)
              }
              placeholder="Leave empty for no cap"
            />
          </div>
        )}

        <div className="admin-coupons-field">
          <label htmlFor="referee-valid-days">
            Welcome coupon valid days (optional)
          </label>

          <input
            id="referee-valid-days"
            type="number"
            min="1"
            step="1"
            value={form.referee_coupon_valid_days}
            onChange={(e) =>
              updateField("referee_coupon_valid_days", e.target.value)
            }
            placeholder="Leave empty for no expiry"
          />
        </div>

        <div className="admin-coupons-modal-actions">
          <button
            type="button"
            className="admin-coupons-btn-primary"
            onClick={handleSave}
            disabled={saveBusy}
          >
            {saveBusy
              ? "Saving..."
              : program
                ? "Save changes"
                : "Create program"}
          </button>
        </div>
      </div>
    </div>
  );
}
