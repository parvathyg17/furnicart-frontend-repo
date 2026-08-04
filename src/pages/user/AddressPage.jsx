import "../../styles/account.css";
import "../../styles/checkout.css";

import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import toast from "react-hot-toast";

import { useDispatch, useSelector } from "react-redux";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../features/address/addressSlice";

import AccountLayout from "../../components/user/AccountLayout";

import ConfirmDialog from "../../components/common/ConfirmDialog.jsx";

export default function AddressPage() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const fromCheckout = searchParams.get("from") === "checkout";

  const editParam = searchParams.get("edit");

  const { addresses } = useSelector((state) => state.address);

  const [loadingLocal, setLoadingLocal] = useState(false);

  const [editId, setEditId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  const [addressPendingDelete, setAddressPendingDelete] = useState(null);

  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    if (!addresses.length) {
      dispatch(getAddresses());
    }
  }, [dispatch, addresses.length]);

  const returnToCheckout = (addressId = null) => {
    navigate(
      "/checkout",
      addressId != null
        ? {
            state: {
              selectAddressId: addressId,
            },
          }
        : undefined,
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,

      [name]: value,
    });

    // CLEAR FIELD ERROR
    setErrors({
      ...errors,

      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = "Enter valid 10 digit phone number";
    }

    if (!form.address_line.trim()) {
      newErrors.address_line = "Address is required";
    } else if (form.address_line.trim().length < 10) {
      newErrors.address_line = "Address should be at least 10 characters";
    }

    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!form.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!form.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Enter valid 6 digit pincode";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = validateForm();

    if (!isValid) return;

    try {
      setLoadingLocal(true);

      if (editId) {
        await dispatch(
          updateAddress({
            id: editId,
            data: form,
          }),
        ).unwrap();

        toast.success("Address updated");

        const savedId = editId;

        resetForm();

        setShowForm(false);

        if (fromCheckout) {
          returnToCheckout(savedId);
        }
      } else {
        const created = await dispatch(addAddress(form)).unwrap();

        toast.success("Address added");

        resetForm();

        setShowForm(false);

        if (fromCheckout) {
          returnToCheckout(created?.id);
        }
      }
    } catch (err) {
      toast.error(err?.error || "Something went wrong");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleEdit = (address) => {
    setEditId(address.id);

    setShowForm(true);

    setForm({
      name: address.name,

      phone: address.phone,

      address_line: address.address_line,

      city: address.city,

      state: address.state,

      pincode: address.pincode,
    });

    setErrors({});
  };

  useEffect(() => {
    if (!fromCheckout || !editParam || !addresses.length) {
      return;
    }

    const addressId = Number(editParam);

    if (Number.isNaN(addressId)) {
      return;
    }

    const address = addresses.find((a) => a.id === addressId);

    if (address) {
      handleEdit(address);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps -- open once when edit param + addresses load
  }, [fromCheckout, editParam, addresses.length]);

  const resetForm = () => {
    setEditId(null);

    setErrors({});

    setForm({
      name: "",
      phone: "",
      address_line: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const handleCancel = () => {
    resetForm();

    setShowForm(false);

    if (fromCheckout) {
      returnToCheckout();
    }
  };

  const handleConfirmDelete = async () => {
    if (!addressPendingDelete) {
      return;
    }

    setDeleteBusy(true);

    try {
      await dispatch(deleteAddress(addressPendingDelete.id)).unwrap();

      toast.success("Address removed");

      setAddressPendingDelete(null);

      if (fromCheckout) {
        returnToCheckout();
      }
    } catch (err) {
      toast.error(err?.error || "Failed to remove address");
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleAddNew = () => {
    resetForm();

    setShowForm(true);
  };

  return (
    <AccountLayout>
      <div className="address-top">
        <div>
          <div className="page-title">Shipping Addresses</div>

          <div className="page-desc">
            Manage your delivery locations.
            {fromCheckout && (
              <> Add or edit an address, then you will return to checkout.</>
            )}
          </div>
        </div>

        <button className="primary-btn" onClick={handleAddNew}>
          + Add New Address
        </button>
      </div>

      {showForm && (
        <div className="address-form-wrapper">
          <div className="address-form-header">
            <h3>{editId ? "Edit Address" : "Add New Address"}</h3>

            <button className="close-form-btn" onClick={handleCancel}>
              ✕
            </button>
          </div>

          <div className="address-form">
            <div>
              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className={`settings-input ${errors.name ? "input-error" : ""}`}
              />

              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div>
              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className={`settings-input ${
                  errors.phone ? "input-error" : ""
                }`}
              />

              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <div className="full-address">
              <textarea
                name="address_line"
                placeholder="Full Address"
                value={form.address_line}
                onChange={handleChange}
                className={`settings-input textarea ${
                  errors.address_line ? "input-error" : ""
                }`}
              />

              {errors.address_line && (
                <p className="field-error">{errors.address_line}</p>
              )}
            </div>

            {/* CITY */}
            <div>
              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                className={`settings-input ${errors.city ? "input-error" : ""}`}
              />

              {errors.city && <p className="field-error">{errors.city}</p>}
            </div>

            {/* STATE */}
            <div>
              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                className={`settings-input ${
                  errors.state ? "input-error" : ""
                }`}
              />

              {errors.state && <p className="field-error">{errors.state}</p>}
            </div>

            {/* PINCODE */}
            <div>
              <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={handleChange}
                className={`settings-input ${
                  errors.pincode ? "input-error" : ""
                }`}
              />

              {errors.pincode && (
                <p className="field-error">{errors.pincode}</p>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="address-form-actions">
            <button className="secondary-btn" onClick={handleCancel}>
              Cancel
            </button>

            <button
              className="primary-btn"
              onClick={handleSubmit}
              disabled={loadingLocal}
            >
              {loadingLocal
                ? "Saving..."
                : editId
                  ? "Update Address"
                  : "Save Address"}
            </button>
          </div>
        </div>
      )}

      {/* ADDRESS LIST */}
      <div className="address-grid">
        {addresses.map((address) => (
          <div key={address.id} className="address-card">
            <div className="address-header">
              <h3>{address.name}</h3>

              {address.is_default && (
                <span className="default-badge">DEFAULT</span>
              )}
            </div>

            <p>{address.phone}</p>

            <p>{address.address_line}</p>

            <p>
              {address.city}, {address.state}
            </p>

            <p>{address.pincode}</p>

            <div className="address-actions">
              {/* EDIT */}
              <button onClick={() => handleEdit(address)}>Edit</button>

              {/* DELETE */}
              <button
                className="danger-btn"
                onClick={() => {
                  setAddressPendingDelete(address);
                }}
              >
                Remove
              </button>

              {/* DEFAULT */}
              {!address.is_default && (
                <button
                  onClick={async () => {
                    try {
                      await dispatch(setDefaultAddress(address.id)).unwrap();

                      toast.success("Default address updated");
                    } catch (err) {
                      toast.error(
                        err?.error || "Failed to update default address",
                      );
                    }
                  }}
                >
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(addressPendingDelete)}
        titleId="address-delete-title"
        title="Remove this address?"
        hint={
          addressPendingDelete
            ? `This will remove the address for ${addressPendingDelete.name}. You can add it again later if needed.`
            : ""
        }
        confirmLabel="Remove address"
        cancelLabel="Keep address"
        busy={deleteBusy}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleteBusy) {
            setAddressPendingDelete(null);
          }
        }}
      />
    </AccountLayout>
  );
}
