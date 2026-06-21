import "../../styles/admin-coupons.css";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  deleteAdminCoupon,
  fetchAdminCoupons,
  patchAdminCoupon,
  postAdminCoupon,
} from "../../features/promotions/couponAPI";

import {
  formatProductApiError,
} from "../../utils/productApiErrors.js";

const PAGE_SIZE = 10;

function toDatetimeLocalValue(
  iso,
) {

  if (
    !iso
  ) {

    return "";
  }

  const d = new Date(
    iso,
  );

  if (
    Number.isNaN(
      d.getTime(),
    )
  ) {

    return "";
  }

  const pad = (
    n,
  ) =>
    String(
      n,
    ).padStart(
      2,
      "0",
    );

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyFormState() {

  return {
    code: "",
    description: "",
    discount_type: "percent",
    discount_value: "",
    min_order_subtotal: "0",
    max_discount_amount: "",
    valid_from: "",
    valid_until: "",
    max_redemptions_total: "",
    max_redemptions_per_user: "",
    is_active: true,
  };
}

function couponToForm(
  c,
) {

  return {
    code: c.code || "",
    description: c.description || "",
    discount_type: c.discount_type || "percent",
    discount_value: String(
      c.discount_value ?? "",
    ),
    min_order_subtotal: String(
      c.min_order_subtotal ?? "0",
    ),
    max_discount_amount:
      c.max_discount_amount != null
        ? String(
            c.max_discount_amount,
          )
        : "",
    valid_from: toDatetimeLocalValue(
      c.valid_from,
    ),
    valid_until: toDatetimeLocalValue(
      c.valid_until,
    ),
    max_redemptions_total:
      c.max_redemptions_total != null
        ? String(
            c.max_redemptions_total,
          )
        : "",
    max_redemptions_per_user:
      c.max_redemptions_per_user != null
        ? String(
            c.max_redemptions_per_user,
          )
        : "",
    is_active: Boolean(
      c.is_active,
    ),
  };
}

function buildPayload(
  form,
) {

  const body = {
    code: form.code.trim(),
    description: (
      form.description || ""
    ).trim(),
    discount_type: form.discount_type,
    discount_value: form.discount_value,
    min_order_subtotal:
      form.min_order_subtotal === ""
        ? "0"
        : form.min_order_subtotal,
    is_active: form.is_active,
  };

  const maxDisc = (
    form.max_discount_amount || ""
  ).trim();

  body.max_discount_amount = maxDisc
    ? maxDisc
    : null;

  body.valid_from = form.valid_from
    ? new Date(
        form.valid_from,
      ).toISOString()
    : null;

  body.valid_until = form.valid_until
    ? new Date(
        form.valid_until,
      ).toISOString()
    : null;

  const parseRedemptionLimit = (
    raw,
  ) => {

    const trimmed = (
      raw || ""
    ).trim();

    if (
      !trimmed
    ) {

      return null;
    }

    const parsed = parseInt(
      trimmed,
      10,
    );

    return Number.isFinite(
      parsed,
    ) && parsed > 0
      ? parsed
      : null;
  };

  body.max_redemptions_total = parseRedemptionLimit(
    form.max_redemptions_total,
  );

  body.max_redemptions_per_user = parseRedemptionLimit(
    form.max_redemptions_per_user,
  );

  return body;
}

function discountLabel(
  c,
) {

  if (
    c.discount_type === "fixed"
  ) {

    return `₹${Number(
      c.discount_value,
    ).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  }

  return `${c.discount_value}%`;
}

export default function AdminCoupons() {

  const [
    coupons,
    setCoupons,
  ] = useState(
    [],
  );

  const [
    loading,
    setLoading,
  ] = useState(
    true,
  );

  const [
    error,
    setError,
  ] = useState(
    "",
  );

  const [
    page,
    setPage,
  ] = useState(
    1,
  );

  const [
    totalPages,
    setTotalPages,
  ] = useState(
    1,
  );

  const [
    search,
    setSearch,
  ] = useState(
    "",
  );

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "",
  );

  const [
    modalOpen,
    setModalOpen,
  ] = useState(
    false,
  );

  const [
    modalMode,
    setModalMode,
  ] = useState(
    "create",
  );

  const [
    editingId,
    setEditingId,
  ] = useState(
    null,
  );

  const [
    form,
    setForm,
  ] = useState(
    emptyFormState,
  );

  const [
    saveBusy,
    setSaveBusy,
  ] = useState(
    false,
  );

  const [
    deleteBusyId,
    setDeleteBusyId,
  ] = useState(
    null,
  );

  const load = useCallback(
    async (
      pageOverride,
    ) => {

      const effectivePage =
        pageOverride !== undefined &&
        pageOverride !== null
          ? pageOverride
          : page;

      setLoading(
        true,
      );

      setError(
        "",
      );

      try {

        const data = await fetchAdminCoupons(
          {
            page: effectivePage,
            pageSize: PAGE_SIZE,
            search,
            isActive: activeTab,
          },
        );

        setCoupons(
          data.results || [],
        );

        setTotalPages(
          data.total_pages || 1,
        );
      } catch {

        setError(
          "Could not load coupons.",
        );
      } finally {

        setLoading(
          false,
        );
      }
    },

    [
      page,
      search,
      activeTab,
    ],
  );

  useEffect(
    () => {

      load();
    },

    [load],
  );

  const openCreate = () => {

    setModalMode(
      "create",
    );

    setEditingId(
      null,
    );

    setForm(
      emptyFormState(),
    );

    setModalOpen(
      true,
    );
  };

  const openEdit = (
    c,
  ) => {

    setModalMode(
      "edit",
    );

    setEditingId(
      c.id,
    );

    setForm(
      couponToForm(
        c,
      ),
    );

    setModalOpen(
      true,
    );
  };

  const closeModal = () => {

    setModalOpen(
      false,
    );

    setEditingId(
      null,
    );

    setSaveBusy(
      false,
    );
  };

  const handleSave = async () => {

    if (
      !form.code.trim()
    ) {

      toast.error(
        "Coupon code is required.",
      );

      return;
    }

    if (
      form.discount_value === ""
      ||
      form.discount_value == null
    ) {

      toast.error(
        "Discount value is required.",
      );

      return;
    }

    setSaveBusy(
      true,
    );

    const payload = buildPayload(
      form,
    );

    try {

      if (
        modalMode === "create"
      ) {

        await postAdminCoupon(
          payload,
        );

        toast.success(
          "Coupon created.",
        );
      } else {

        await patchAdminCoupon(
          editingId,
          payload,
        );

        toast.success(
          "Coupon updated.",
        );
      }

      closeModal();

      if (
        modalMode === "create"
      ) {

        setPage(
          1,
        );

        await load(
          1,
        );
      } else {

        await load();
      }
    } catch (err) {

      toast.error(

        formatProductApiError(
          err.response?.data,
        ) ||

          "Could not save coupon.",
      );
    } finally {

      setSaveBusy(
        false,
      );
    }
  };

  const handleDelete = async (
    c,
  ) => {

    if (
      !window.confirm(
        `Delete coupon ${c.code}?`,
      )
    ) {

      return;
    }

    setDeleteBusyId(
      c.id,
    );

    try {

      await deleteAdminCoupon(
        c.id,
      );

      toast.success(
        "Coupon deleted.",
      );

      if (
        coupons.length === 1 &&
        page > 1
      ) {

        setPage(
          (
            p,
          ) =>
            p - 1,
        );
      } else {

        await load();
      }
    } catch (err) {

      toast.error(

        formatProductApiError(
          err.response?.data,
        ) ||

          "Could not delete coupon.",
      );
    } finally {

      setDeleteBusyId(
        null,
      );
    }
  };

  const onFormChange = (
    e,
  ) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm(
      (
        prev,
      ) => ({

        ...prev,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      }),
    );
  };

  return (

    <div className="admin-coupons-page">

      <header className="admin-coupons-header">

        <div>

          <h1>
            Coupons
          </h1>

          <p>
            Create and manage discount codes for checkout (customer apply flow comes next).
          </p>
        </div>

        <button
          type="button"
          className="admin-coupons-primary"
          onClick={openCreate}
        >

          <Plus size={18} />

          New coupon

        </button>
      </header>

      <div className="admin-coupons-toolbar">

        <input
          type="search"
          placeholder="Search by code or description…"
          value={search}
          onChange={(
            e,
          ) => {

            setPage(
              1,
            );

            setSearch(
              e.target.value,
            );
          }}
        />

        <div className="admin-coupons-tabs">

          <button
            type="button"
            className={
              activeTab === ""
                ? "is-active"
                : ""
            }
            onClick={() => {

              setPage(
                1,
              );

              setActiveTab(
                "",
              );
            }}
          >
            All
          </button>

          <button
            type="button"
            className={
              activeTab === "true"
                ? "is-active"
                : ""
            }
            onClick={() => {

              setPage(
                1,
              );

              setActiveTab(
                "true",
              );
            }}
          >
            Active
          </button>

          <button
            type="button"
            className={
              activeTab === "false"
                ? "is-active"
                : ""
            }
            onClick={() => {

              setPage(
                1,
              );

              setActiveTab(
                "false",
              );
            }}
          >
            Inactive
          </button>
        </div>
      </div>

      {
        loading && (

          <p className="admin-coupons-muted">
            Loading…
          </p>
        )
      }

      {
        error && (

          <p className="admin-coupons-error">
            {error}
          </p>
        )
      }

      {
        !loading &&
        !error &&
        coupons.length === 0 && (

          <p className="admin-coupons-muted">
            No coupons found.
          </p>
        )
      }

      {
        !loading &&
        !error &&
        coupons.length > 0 && (

          <div className="admin-coupons-table-wrap">

            <table className="admin-coupons-table">

              <thead>

                <tr>

                  <th>
                    Code
                  </th>

                  <th>
                    Discount
                  </th>

                  <th>
                    Min subtotal
                  </th>

                  <th>
                    Used
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Valid until
                  </th>

                  <th>
                  </th>
                </tr>
              </thead>

              <tbody>

                {
                  coupons.map(
                    (
                      c,
                    ) => (

                      <tr key={c.id}>

                        <td className="admin-coupons-code">
                          {c.code}
                        </td>

                        <td>
                          {discountLabel(
                            c,
                          )}
                        </td>

                        <td>
                          {Number(
                            c.min_order_subtotal,
                          ).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </td>

                        <td>
                          {c.times_used}
                        </td>

                        <td>

                          <span
                            className={
                              c.is_active
                                ? "admin-coupons-badge admin-coupons-badge--on"
                                : "admin-coupons-badge admin-coupons-badge--off"
                            }
                          >
                            {c.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="admin-coupons-muted">

                          {
                            c.valid_until
                              ? new Date(
                                  c.valid_until,
                                ).toLocaleString()
                              : "—"}
                        </td>

                        <td>

                          <div className="admin-coupons-actions">

                            <button
                              type="button"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  c,
                                )
                              }
                            >

                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              title="Delete"
                              disabled={
                                deleteBusyId ===
                                c.id
                              }
                              onClick={() =>
                                handleDelete(
                                  c,
                                )
                              }
                            >

                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )
                }
              </tbody>
            </table>
          </div>
        )
      }

      {
        totalPages > 1 && (

          <div className="admin-coupons-pagination">

            <button
              type="button"
              disabled={
                page <= 1 ||
                loading
              }
              onClick={() => {

                setPage(
                  (
                    p,
                  ) =>
                    p - 1,
                );
              }}
            >
              Previous
            </button>

            <span className="admin-coupons-muted">
              Page
              {" "}
              {page}
              {" "}
              of
              {" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                page >= totalPages ||
                loading
              }
              onClick={() => {

                setPage(
                  (
                    p,
                  ) =>
                    p + 1,
                );
              }}
            >
              Next
            </button>
          </div>
        )
      }

      {
        modalOpen && (

          <div
            className="admin-coupons-modal-backdrop"
            role="presentation"
            onClick={(
              e,
            ) => {

              if (
                e.target === e.currentTarget
              ) {

                closeModal();
              }
            }}
          >

            <div
              className="admin-coupons-modal"
              role="dialog"
              aria-modal
              aria-labelledby="coupon-modal-title"
              onClick={(
                e,
              ) =>
                e.stopPropagation()}
            >

              <h2 id="coupon-modal-title">
                {modalMode === "create"
                  ? "New coupon"
                  : "Edit coupon"}
              </h2>

              <div className="admin-coupons-field">

                <label htmlFor="cc-code">
                  Code
                </label>

                <input
                  id="cc-code"
                  name="code"
                  value={form.code}
                  onChange={onFormChange}
                  autoComplete="off"
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="cc-desc">
                  Description
                </label>

                <textarea
                  id="cc-desc"
                  name="description"
                  value={form.description}
                  onChange={onFormChange}
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="cc-type">
                  Discount type
                </label>

                <select
                  id="cc-type"
                  name="discount_type"
                  value={form.discount_type}
                  onChange={onFormChange}
                >

                  <option value="percent">
                    Percentage
                  </option>

                  <option value="fixed">
                    Fixed amount
                  </option>
                </select>
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="cc-val">
                  Discount value
                </label>

                <input
                  id="cc-val"
                  name="discount_value"
                  type="text"
                  inputMode="decimal"
                  value={form.discount_value}
                  onChange={onFormChange}
                  placeholder={
                    form.discount_type === "percent"
                      ? "e.g. 10"
                      : "e.g. 500.00"
                  }
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="cc-min">
                  Minimum order subtotal
                </label>

                <input
                  id="cc-min"
                  name="min_order_subtotal"
                  type="text"
                  inputMode="decimal"
                  value={form.min_order_subtotal}
                  onChange={onFormChange}
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="cc-maxd">
                  Max discount cap (optional, % coupons)
                </label>

                <input
                  id="cc-maxd"
                  name="max_discount_amount"
                  type="text"
                  inputMode="decimal"
                  value={form.max_discount_amount}
                  onChange={onFormChange}
                  placeholder="Leave empty for no cap"
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="cc-vf">
                  Valid from (optional)
                </label>

                <input
                  id="cc-vf"
                  name="valid_from"
                  type="datetime-local"
                  value={form.valid_from}
                  onChange={onFormChange}
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="cc-vu">
                  Valid until (optional)
                </label>

                <input
                  id="cc-vu"
                  name="valid_until"
                  type="datetime-local"
                  value={form.valid_until}
                  onChange={onFormChange}
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="cc-maxt">
                  Max redemptions total (optional)
                </label>

                <input
                  id="cc-maxt"
                  name="max_redemptions_total"
                  type="number"
                  min={0}
                  value={form.max_redemptions_total}
                  onChange={onFormChange}
                  placeholder="Unlimited if empty"
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="cc-maxu">
                  Max per user (optional)
                </label>

                <input
                  id="cc-maxu"
                  name="max_redemptions_per_user"
                  type="number"
                  min={0}
                  value={form.max_redemptions_per_user}
                  onChange={onFormChange}
                  placeholder="Unlimited if empty"
                />
              </div>

              <div className="admin-coupons-field admin-coupons-field--inline">

                <input
                  id="cc-active"
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={onFormChange}
                />

                <label htmlFor="cc-active">
                  Active
                </label>
              </div>

              <div className="admin-coupons-modal-actions">

                <button
                  type="button"
                  className="admin-coupons-btn-secondary"
                  disabled={saveBusy}
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-coupons-btn-primary"
                  disabled={saveBusy}
                  onClick={handleSave}
                >
                  {saveBusy
                    ? "Saving…"
                    : "Save"}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}
