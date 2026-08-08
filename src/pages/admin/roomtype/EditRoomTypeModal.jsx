import "../../../styles/createcategorymodal.css";

import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { X, ImagePlus, Check } from "lucide-react";

import { updateRoomType } from "../../../features/catalog/roomtype/roomTypeSlice";

export default function EditRoomTypeModal({
  isOpen,
  onClose,
  roomType,
  onSuccess,
}) {
  const dispatch = useDispatch();

  const { roomTypeUpdateLoading } = useSelector((state) => state.roomType);

  const [name, setName] = useState("");

  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setImage(null);
      setPreview(null);
      setFormErrors({});

      return;
    }

    if (roomType) {
      setName(roomType.name || "");
      setPreview(roomType.image || null);
      setImage(null);
      setFormErrors({});
    }
  }, [roomType, isOpen]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setFormErrors((prev) => ({
      ...prev,

      image: "",
    }));

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,

        image: "Image must be below 5MB",
      }));

      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormErrors((prev) => ({
        ...prev,

        image: "Only image files allowed",
      }));

      return;
    }

    setImage(file);

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roomType) return;

    setFormErrors({});

    const formData = new FormData();

    formData.append("name", name);

    if (image) {
      formData.append("image", image);
    }

    try {
      await dispatch(
        updateRoomType({
          roomTypeId: roomType.id,

          data: formData,
        }),
      ).unwrap();

      onSuccess?.();

      onClose();
    } catch (error) {
      setFormErrors({
        name: error?.name?.[0] || error?.name || "",

        image: error?.image?.[0] || error?.image || "",
      });
    }
  };

  if (!isOpen || !roomType) return null;

  return (
    <div className="category-modal-overlay">
      <div className="category-modal">
        <div className="category-modal-header">
          <div>
            <h2>Edit Room Type</h2>

            <p>Update your room type details and image.</p>
          </div>

          <button onClick={onClose} className="close-btn">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label>Room Type Name</label>

            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);

                setFormErrors((prev) => ({
                  ...prev,

                  name: "",
                }));
              }}
              placeholder="e.g. Living Room"
              required
              className={formErrors.name ? "input-error" : ""}
            />

            {formErrors.name && (
              <p className="field-error">{formErrors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label>Room Type Image</label>

            <div
              className={`image-upload-box ${
                formErrors.image ? "input-error" : ""
              }`}
              onClick={() =>
                document.getElementById("edit-roomtype-image-input")?.click()
              }
            >
              <input
                id="edit-roomtype-image-input"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />

              {preview ? (
                <img src={preview} alt="Preview" className="preview-image" />
              ) : (
                <div className="upload-content">
                  <div className="upload-icon-box">
                    <ImagePlus size={46} />
                  </div>

                  <div className="upload-btn">Upload Image</div>

                  <p>High-resolution JPEG or PNG. Max 5MB.</p>
                </div>
              )}
            </div>

            {formErrors.image && (
              <p className="field-error">{formErrors.image}</p>
            )}
          </div>

          <div className="category-modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>

            <button
              type="submit"
              disabled={roomTypeUpdateLoading}
              className="submit-button"
            >
              <Check size={18} />

              {roomTypeUpdateLoading ? "Updating..." : "Update Room Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
