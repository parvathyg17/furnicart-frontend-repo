// ==========================================
// src/pages/user/AddressPage.jsx
// ==========================================

import "../../styles/account.css";

import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../features/address/addressSlice";

import AccountLayout from "../../components/user/AccountLayout";


export default function AddressPage() {

  const dispatch = useDispatch();

  const { addresses } =
    useSelector(
      (state) => state.address
    );


  // ==========================================
  // LOCAL STATES
  // ==========================================

  const [
    loadingLocal,
    setLoadingLocal,
  ] = useState(false);

  const [
    editId,
    setEditId,
  ] = useState(null);

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [form, setForm] =
    useState({
      name: "",
      phone: "",
      address_line: "",
      city: "",
      state: "",
      pincode: "",
    });

  const [errors, setErrors] =
    useState({});


  // ==========================================
  // FETCH ADDRESSES
  // ==========================================

  useEffect(() => {

    if (!addresses.length) {

      dispatch(
        getAddresses()
      );

    }

  }, [
    dispatch,
    addresses.length,
  ]);


  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange =
    (e) => {

      const { name, value } =
        e.target;

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


  // ==========================================
  // VALIDATE FORM
  // ==========================================

  const validateForm = () => {

    const newErrors = {};

    // NAME
    if (!form.name.trim()) {

      newErrors.name =
        "Full name is required";

    }

    // PHONE
    if (!form.phone.trim()) {

      newErrors.phone =
        "Phone number is required";

    } else if (
      !/^[6-9]\d{9}$/.test(
        form.phone
      )
    ) {

      newErrors.phone =
        "Enter valid 10 digit phone number";

    }

    // ADDRESS
    if (
      !form.address_line.trim()
    ) {

      newErrors.address_line =
        "Address is required";

    } else if (
      form.address_line.length <
      10
    ) {

      newErrors.address_line =
        "Address should be at least 10 characters";

    }

    // CITY
    if (!form.city.trim()) {

      newErrors.city =
        "City is required";

    }

    // STATE
    if (!form.state.trim()) {

      newErrors.state =
        "State is required";

    }

    // PINCODE
    if (!form.pincode.trim()) {

      newErrors.pincode =
        "Pincode is required";

    } else if (
      !/^\d{6}$/.test(
        form.pincode
      )
    ) {

      newErrors.pincode =
        "Enter valid 6 digit pincode";

    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };


  // ==========================================
  // ADD / UPDATE ADDRESS
  // ==========================================

  const handleSubmit =
    async () => {

      const isValid =
        validateForm();

      if (!isValid) return;

      try {

        setLoadingLocal(true);

        if (editId) {

          await dispatch(
            updateAddress({
              id: editId,
              data: form,
            })
          ).unwrap();

        } else {

          await dispatch(
            addAddress(form)
          ).unwrap();

        }

        toast.success(

          editId
            ? "Address updated"
            : "Address added"

        );

        resetForm();

        setShowForm(false);

      } catch (err) {

        toast.error(

          err?.error ||
          "Something went wrong"

        );

      } finally {

        setLoadingLocal(false);

      }
    };


  // ==========================================
  // EDIT ADDRESS
  // ==========================================

  const handleEdit =
    (address) => {

      setEditId(address.id);

      setShowForm(true);

      setForm({
        name: address.name,

        phone: address.phone,

        address_line:
          address.address_line,

        city: address.city,

        state: address.state,

        pincode:
          address.pincode,
      });

      setErrors({});

    };


  // ==========================================
  // RESET FORM
  // ==========================================

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


  // ==========================================
  // CANCEL FORM
  // ==========================================

  const handleCancel =
    () => {

      resetForm();

      setShowForm(false);

    };


  // ==========================================
  // ADD NEW ADDRESS
  // ==========================================

  const handleAddNew =
    () => {

      resetForm();

      setShowForm(true);

    };


  return (

    <AccountLayout>

      {/* HEADER */}
      <div className="address-top">

        <div>

          <div className="page-title">
            Shipping Addresses
          </div>

          <div className="page-desc">
            Manage your delivery
            locations.
          </div>

        </div>

        <button
          className="primary-btn"
          onClick={
            handleAddNew
          }
        >
          + Add New Address
        </button>

      </div>


      {/* FORM */}
      {showForm && (

        <div className="address-form-wrapper">

          <div className="address-form-header">

            <h3>

              {editId
                ? "Edit Address"
                : "Add New Address"}

            </h3>

            <button
              className="close-form-btn"
              onClick={
                handleCancel
              }
            >
              ✕
            </button>

          </div>

          <div className="address-form">

            {/* NAME */}
            <div>

              <input
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={
                  handleChange
                }
                className={`settings-input ${
                  errors.name
                    ? "input-error"
                    : ""
                }`}
              />

              {errors.name && (

                <p className="field-error">
                  {errors.name}
                </p>

              )}

            </div>


            {/* PHONE */}
            <div>

              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={
                  handleChange
                }
                className={`settings-input ${
                  errors.phone
                    ? "input-error"
                    : ""
                }`}
              />

              {errors.phone && (

                <p className="field-error">
                  {errors.phone}
                </p>

              )}

            </div>


            {/* ADDRESS */}
            <div className="full-address">

              <textarea
                name="address_line"
                placeholder="Full Address"
                value={
                  form.address_line
                }
                onChange={
                  handleChange
                }
                className={`settings-input textarea ${
                  errors.address_line
                    ? "input-error"
                    : ""
                }`}
              />

              {errors.address_line && (

                <p className="field-error">
                  {
                    errors.address_line
                  }
                </p>

              )}

            </div>


            {/* CITY */}
            <div>

              <input
                name="city"
                placeholder="City"
                value={form.city}
                onChange={
                  handleChange
                }
                className={`settings-input ${
                  errors.city
                    ? "input-error"
                    : ""
                }`}
              />

              {errors.city && (

                <p className="field-error">
                  {errors.city}
                </p>

              )}

            </div>


            {/* STATE */}
            <div>

              <input
                name="state"
                placeholder="State"
                value={form.state}
                onChange={
                  handleChange
                }
                className={`settings-input ${
                  errors.state
                    ? "input-error"
                    : ""
                }`}
              />

              {errors.state && (

                <p className="field-error">
                  {errors.state}
                </p>

              )}

            </div>


            {/* PINCODE */}
            <div>

              <input
                name="pincode"
                placeholder="Pincode"
                value={form.pincode}
                onChange={
                  handleChange
                }
                className={`settings-input ${
                  errors.pincode
                    ? "input-error"
                    : ""
                }`}
              />

              {errors.pincode && (

                <p className="field-error">
                  {errors.pincode}
                </p>

              )}

            </div>

          </div>


          {/* ACTIONS */}
          <div className="address-form-actions">

            <button
              className="secondary-btn"
              onClick={
                handleCancel
              }
            >
              Cancel
            </button>

            <button
              className="primary-btn"
              onClick={
                handleSubmit
              }
              disabled={
                loadingLocal
              }
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

        {addresses.map(
          (address) => (

            <div
              key={address.id}
              className="address-card"
            >

              <div className="address-header">

                <h3>
                  {address.name}
                </h3>

                {address.is_default && (

                  <span className="default-badge">
                    DEFAULT
                  </span>

                )}

              </div>

              <p>
                {address.phone}
              </p>

              <p>
                {address.address_line}
              </p>

              <p>
                {address.city},{" "}
                {address.state}
              </p>

              <p>
                {address.pincode}
              </p>

              <div className="address-actions">

                {/* EDIT */}
                <button
                  onClick={() =>
                    handleEdit(
                      address
                    )
                  }
                >
                  Edit
                </button>


                {/* DELETE */}
                <button
                  className="danger-btn"
                  onClick={async () => {

                    try {

                      await dispatch(
                        deleteAddress(
                          address.id
                        )
                      ).unwrap();

                      toast.success(
                        "Address removed"
                      );

                    } catch (err) {

                      toast.error(

                        err?.error ||
                        "Failed to remove address"

                      );

                    }
                  }}
                >
                  Remove
                </button>


                {/* DEFAULT */}
                {!address.is_default && (

                  <button
                    onClick={async () => {

                      try {

                        await dispatch(
                          setDefaultAddress(
                            address.id
                          )
                        ).unwrap();

                        toast.success(
                          "Default address updated"
                        );

                      } catch (err) {

                        toast.error(

                          err?.error ||
                          "Failed to update default address"

                        );

                      }
                    }}
                  >
                    Set Default
                  </button>

                )}

              </div>

            </div>

          )
        )}

      </div>

    </AccountLayout>
  );
}