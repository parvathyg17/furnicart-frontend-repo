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

import ConfirmDialog from "../../components/common/ConfirmDialog";

import {
  deleteAdminOffer,
  fetchAdminOffers,
  patchAdminOffer,
  postAdminOffer,
} from "../../features/promotions/offerAPI";

import {
  getAdminCategoriesAPI,
} from "../../features/catalog/category/categoryAPI";

import {
  getAdminProductsAPI,
} from "../../features/catalog/product/productAPI";

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
    title: "",
    description: "",
    offer_type: "product",
    product: "",
    category: "",
    discount_type: "percent",
    discount_value: "",
    max_discount_amount: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
    image: null,
  };
}

function offerToForm(
  offer,
) {

  return {
    title: offer.title || "",
    description: offer.description || "",
    offer_type: offer.offer_type || "product",
    product:
      offer.product != null
        ? String(
            offer.product,
          )
        : "",
    category:
      offer.category != null
        ? String(
            offer.category,
          )
        : "",
    discount_type: offer.discount_type || "percent",
    discount_value: String(
      offer.discount_value ?? "",
    ),
    max_discount_amount:
      offer.max_discount_amount != null
        ? String(
            offer.max_discount_amount,
          )
        : "",
    valid_from: toDatetimeLocalValue(
      offer.valid_from,
    ),
    valid_until: toDatetimeLocalValue(
      offer.valid_until,
    ),
    is_active: Boolean(
      offer.is_active,
    ),
    image: offer.image || null,
  };
}

function buildPayload(form) {
  const formData = new FormData();
  formData.append("title", form.title.trim());
  formData.append("description", (form.description || "").trim());
  formData.append("offer_type", form.offer_type);
  formData.append("discount_type", form.discount_type);
  formData.append("discount_value", form.discount_value);
  formData.append("is_active", form.is_active);

  if (form.offer_type === "product") {
    formData.append("product", parseInt(form.product, 10));
    formData.append("category", "");
  } else {
    formData.append("category", parseInt(form.category, 10));
    formData.append("product", "");
  }

  const maxDisc = (form.max_discount_amount || "").trim();
  if (maxDisc) {
    formData.append("max_discount_amount", maxDisc);
  }

  if (form.valid_from) {
    formData.append("valid_from", new Date(form.valid_from).toISOString());
  }

  if (form.valid_until) {
    formData.append("valid_until", new Date(form.valid_until).toISOString());
  }

  if (form.image instanceof File) {
    formData.append("image", form.image);
  }

  return formData;
}

function discountLabel(
  offer,
) {

  if (
    offer.discount_type === "fixed"
  ) {

    return `₹${Number(
      offer.discount_value,
    ).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  }

  return `${offer.discount_value}%`;
}

function targetLabel(
  offer,
) {

  if (
    offer.offer_type === "product"
  ) {

    return offer.product_name
      ? `Product: ${offer.product_name}`
      : "Product";
  }

  return offer.category_name
    ? `Category: ${offer.category_name}`
    : "Category";
}

export default function AdminOffers() {

  const [
    offers,
    setOffers,
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
    typeTab,
    setTypeTab,
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

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);

  const [
    products,
    setProducts,
  ] = useState(
    [],
  );

  const [
    categories,
    setCategories,
  ] = useState(
    [],
  );

  const [
    catalogLoading,
    setCatalogLoading,
  ] = useState(
    false,
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

        const data = await fetchAdminOffers(
          {
            page: effectivePage,
            pageSize: PAGE_SIZE,
            search,
            isActive: activeTab,
            offerType: typeTab,
          },
        );

        setOffers(
          data.results || [],
        );

        setTotalPages(
          data.total_pages || 1,
        );
      } catch {

        setError(
          "Could not load offers.",
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
      typeTab,
    ],
  );

  useEffect(
    () => {

      load();
    },

    [load],
  );

  const loadCatalogOptions = useCallback(
    async () => {

      setCatalogLoading(
        true,
      );

      try {

        const [
          productData,
          categoryData,
        ] = await Promise.all(
          [
            getAdminProductsAPI(
              {
                page_size: 200,
                is_active: true,
              },
            ),
            getAdminCategoriesAPI(
              {
                page_size: 200,
                is_active: true,
              },
            ),
          ],
        );

        setProducts(
          productData.results
            || productData.data
            || productData
            || [],
        );

        setCategories(
          categoryData.results
            || categoryData.data
            || categoryData
            || [],
        );
      } catch {

        toast.error(
          "Could not load products or categories.",
        );
      } finally {

        setCatalogLoading(
          false,
        );
      }
    },

    [],
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

    loadCatalogOptions();
  };

  const openEdit = (
    offer,
  ) => {

    setModalMode(
      "edit",
    );

    setEditingId(
      offer.id,
    );

    setForm(
      offerToForm(
        offer,
      ),
    );

    setModalOpen(
      true,
    );

    loadCatalogOptions();
  };

  const closeModal = () => {

    setModalOpen(
      false,
    );
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

  const handleSave = async () => {

    setSaveBusy(
      true,
    );

    try {

      const body = buildPayload(
        form,
      );

      if (
        modalMode === "create"
      ) {

        await postAdminOffer(
          body,
        );

        toast.success(
          "Offer created.",
        );
      } else {

        await patchAdminOffer(
          editingId,
          body,
        );

        toast.success(
          "Offer updated.",
        );
      }

      closeModal();

      load(
        1,
      );

      setPage(
        1,
      );
    } catch (
      err
    ) {

      toast.error(
        formatProductApiError(
          err,
          "Could not save offer.",
        ),
      );
    } finally {

      setSaveBusy(
        false,
      );
    }
  };

  const requestDelete = (
    offer,
  ) => {
    setOfferToDelete(offer);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return;
    const offer = offerToDelete;
    setConfirmOpen(false);

    setDeleteBusyId(
      offer.id,
    );

    try {

      await deleteAdminOffer(
        offer.id,
      );

      toast.success(
        "Offer deleted.",
      );

      load();
    } catch (
      err
    ) {

      toast.error(
        formatProductApiError(
          err,
          "Could not delete offer.",
        ),
      );
    } finally {

      setDeleteBusyId(
        null,
      );
      setOfferToDelete(null);
    }
  };

  return (

    <div className="admin-coupons-page">

      <header className="admin-coupons-header">

        <div>

          <h1>
            Offers
          </h1>

          <p>
            Product- or category-specific discounts applied automatically at checkout.
          </p>
        </div>

        <button
          type="button"
          className="admin-coupons-primary"
          onClick={openCreate}
        >

          <Plus size={18} />
          New offer
        </button>
      </header>

      <div className="admin-coupons-toolbar">

        <input
          type="search"
          placeholder="Search title, product, category…"
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

        <div className="admin-coupons-tabs">

          <button
            type="button"
            className={
              typeTab === ""
                ? "is-active"
                : ""
            }
            onClick={() => {

              setPage(
                1,
              );

              setTypeTab(
                "",
              );
            }}
          >
            All types
          </button>

          <button
            type="button"
            className={
              typeTab === "product"
                ? "is-active"
                : ""
            }
            onClick={() => {

              setPage(
                1,
              );

              setTypeTab(
                "product",
              );
            }}
          >
            Product
          </button>

          <button
            type="button"
            className={
              typeTab === "category"
                ? "is-active"
                : ""
            }
            onClick={() => {

              setPage(
                1,
              );

              setTypeTab(
                "category",
              );
            }}
          >
            Category
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
        offers.length === 0 && (

          <p className="admin-coupons-muted">
            No offers found.
          </p>
        )
      }

      {
        !loading &&
        !error &&
        offers.length > 0 && (

          <div className="admin-coupons-table-wrap">

            <table className="admin-coupons-table">

              <thead>

                <tr>

                  <th>
                    Title
                  </th>

                  <th>
                    Target
                  </th>

                  <th>
                    Discount
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
                  offers.map(
                    (
                      offer,
                    ) => (

                      <tr key={offer.id}>

                        <td className="admin-coupons-code">
                          {offer.title}
                        </td>

                        <td>
                          {targetLabel(
                            offer,
                          )}
                        </td>

                        <td>
                          {discountLabel(
                            offer,
                          )}
                        </td>

                        <td>

                          <span
                            className={
                              offer.is_active
                                ? "admin-coupons-badge admin-coupons-badge--on"
                                : "admin-coupons-badge admin-coupons-badge--off"
                            }
                          >
                            {offer.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="admin-coupons-muted">

                          {
                            offer.valid_until
                              ? new Date(
                                  offer.valid_until,
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
                                  offer,
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
                                offer.id
                              }
                              onClick={() =>
                                requestDelete(
                                  offer,
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
              aria-labelledby="offer-modal-title"
              onClick={(
                e,
              ) =>
                e.stopPropagation()}
            >

              <h2 id="offer-modal-title">
                {modalMode === "create"
                  ? "New offer"
                  : "Edit offer"}
              </h2>

              <div className="admin-coupons-field">

                <label htmlFor="of-title">
                  Title
                </label>

                <input
                  id="of-title"
                  name="title"
                  value={form.title}
                  onChange={onFormChange}
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="of-desc">
                  Description
                </label>

                <textarea
                  id="of-desc"
                  name="description"
                  value={form.description}
                  onChange={onFormChange}
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="of-type">
                  Offer type
                </label>

                <select
                  id="of-type"
                  name="offer_type"
                  value={form.offer_type}
                  onChange={onFormChange}
                >

                  <option value="product">
                    Product-specific
                  </option>

                  <option value="category">
                    Category-specific
                  </option>
                </select>
              </div>

              {
                form.offer_type === "product" && (

                  <div className="admin-coupons-field">

                    <label htmlFor="of-product">
                      Product
                    </label>

                    <select
                      id="of-product"
                      name="product"
                      value={form.product}
                      onChange={onFormChange}
                      disabled={catalogLoading}
                    >

                      <option value="">
                        Select product…
                      </option>

                      {
                        products.map(
                          (
                            p,
                          ) => (

                            <option
                              key={p.id}
                              value={p.id}
                            >
                              {p.name}
                            </option>
                          ),
                        )
                      }
                    </select>
                  </div>
                )
              }

              {
                form.offer_type === "category" && (

                  <div className="admin-coupons-field">

                    <label htmlFor="of-category">
                      Category
                    </label>

                    <select
                      id="of-category"
                      name="category"
                      value={form.category}
                      onChange={onFormChange}
                      disabled={catalogLoading}
                    >

                      <option value="">
                        Select category…
                      </option>

                      {
                        categories.map(
                          (
                            c,
                          ) => (

                            <option
                              key={c.id}
                              value={c.id}
                            >
                              {c.name}
                            </option>
                          ),
                        )
                      }
                    </select>
                  </div>
                )
              }

              <div className="admin-coupons-field">

                <label htmlFor="of-disc-type">
                  Discount type
                </label>

                <select
                  id="of-disc-type"
                  name="discount_type"
                  value={form.discount_type}
                  onChange={onFormChange}
                >

                  <option value="percent">
                    Percentage
                  </option>

                  <option value="fixed">
                    Fixed amount (per line)
                  </option>
                </select>
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="of-disc-val">
                  Discount value
                </label>

                <input
                  id="of-disc-val"
                  name="discount_value"
                  type="text"
                  inputMode="decimal"
                  value={form.discount_value}
                  onChange={onFormChange}
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="of-maxd">
                  Max discount cap (optional, % offers)
                </label>

                <input
                  id="of-maxd"
                  name="max_discount_amount"
                  type="text"
                  inputMode="decimal"
                  value={form.max_discount_amount}
                  onChange={onFormChange}
                  placeholder="Leave empty for no cap"
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="of-vf">
                  Valid from (optional)
                </label>

                <input
                  id="of-vf"
                  name="valid_from"
                  type="datetime-local"
                  value={form.valid_from}
                  onChange={onFormChange}
                />
              </div>

              <div className="admin-coupons-field">

                <label htmlFor="of-vu">
                  Valid until (optional)
                </label>

                <input
                  id="of-vu"
                  name="valid_until"
                  type="datetime-local"
                  value={form.valid_until}
                  onChange={onFormChange}
                />
              </div>

              <div className="admin-coupons-field">
                <label htmlFor="of-img">
                  Banner Image (optional)
                </label>
                <input
                  id="of-img"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setForm((prev) => ({ ...prev, image: file }));
                    }
                  }}
                />
                {typeof form.image === "string" && form.image && (
                  <p className="admin-coupons-muted" style={{ marginTop: "4px" }}>
                    Current image uploaded. Select a new file to replace it.
                  </p>
                )}
              </div>

              <label className="admin-coupons-check">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={onFormChange}
                />
                Active
              </label>

              <div className="admin-coupons-modal-actions">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saveBusy}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-coupons-primary"
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

      <ConfirmDialog
        open={confirmOpen}
        titleId="delete-offer-title"
        title="Delete Offer"
        hint={`Are you sure you want to delete the offer "${offerToDelete?.title}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setOfferToDelete(null);
        }}
      />
    </div>
  );
}
