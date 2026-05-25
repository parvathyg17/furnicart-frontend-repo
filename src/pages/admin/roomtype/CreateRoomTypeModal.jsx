import "../../../styles/createcategorymodal.css";

import {
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  X,
  ImagePlus,
  Check,
} from "lucide-react";

import {
  createRoomType,
  getAdminRoomTypes,
} from "../../../features/catalog/roomType/roomTypeSlice";

export default function CreateRoomTypeModal({

  isOpen,
  onClose,

}) {

  const dispatch = useDispatch();

  const {

    roomTypeLoading,

  } = useSelector(
    (state) => state.roomType
  );

  const [name, setName] =
    useState("");

  const [image, setImage] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  // ==========================================
  // HANDLE IMAGE
  // ==========================================

  const handleImageChange =
    (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      setImage(file);

      setPreview(
        URL.createObjectURL(file)
      );
    };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const formData =
        new FormData();

      formData.append(
        "name",
        name
      );

      if (image) {

        formData.append(
          "image",
          image
        );
      }

      const result =
        await dispatch(
          createRoomType(
            formData
          )
        );

      if (
        createRoomType.fulfilled.match(
          result
        )
      ) {

        dispatch(
          getAdminRoomTypes()
        );

        setName("");

        setImage(null);

        setPreview(null);

        onClose();
      }
    };

  if (!isOpen) return null;

  return (

    <div className="category-modal-overlay">

      <div className="category-modal">

        {/* HEADER */}

        <div className="category-modal-header">

          <div>

            <h2>

              New Room Type

            </h2>

            <p>

              Define a new room type for your
              furniture collection.

            </p>

          </div>

          <button
            onClick={onClose}
            className="close-btn"
          >

            <X size={28} />

          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="category-form"
        >

          {/* NAME */}

          <div className="form-group">

            <label>

              Room Type Name

            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="e.g. Living Room"
              required
            />

          </div>

          {/* IMAGE */}

          <div className="form-group">

            <label>

              Room Type Image

            </label>

            <div
              className="image-upload-box"
              onClick={() =>
                document
                  .getElementById(
                    "roomtype-image-input"
                  )
                  ?.click()
              }
            >

              <input
                id="roomtype-image-input"
                type="file"
                accept="image/*"
                hidden
                onChange={
                  handleImageChange
                }
              />

              {
                preview ? (

                  <img
                    src={preview}
                    alt="Preview"
                    className="preview-image"
                  />

                ) : (

                  <div className="upload-content">

                    <div className="upload-icon-box">

                      <ImagePlus size={46} />

                    </div>

                    <div className="upload-btn">

                      Upload Image

                    </div>

                    <p>

                      High-resolution JPEG or PNG.
                      Max 5MB.

                    </p>

                  </div>
                )
              }

            </div>

          </div>

          {/* FOOTER */}

          <div className="category-modal-footer">

            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >

              Cancel

            </button>

            <button
              type="submit"
              disabled={roomTypeLoading}
              className="submit-button"
            >

              <Check size={18} />

              {
                roomTypeLoading

                  ? "Creating..."

                  : "Create Room Type"
              }

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}