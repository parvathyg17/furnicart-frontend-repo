import {
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
} from "react-redux";

import {

  updateRoomType,

} from "../../../features/catalog/roomType/roomTypeSlice";

export default function EditRoomTypeModal({

  isOpen,
  onClose,
  roomType,

}) {

  const dispatch = useDispatch();

  const [name, setName] =
    useState("");

  const [image, setImage] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  // ==========================================
  // PREFILL DATA
  // ==========================================

  useEffect(() => {

    if (roomType) {

      setName(
        roomType.name || ""
      );

      setPreview(
        roomType.image || null
      );
    }

  }, [roomType]);

  // ==========================================
  // HANDLE IMAGE
  // ==========================================

  const handleImageChange = (
    e
  ) => {

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

      if (!roomType) return;

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

          updateRoomType({

            roomTypeId:
              roomType.id,

            data: formData,
          })
        );

      if (
        updateRoomType.fulfilled.match(
          result
        )
      ) {

        onClose();
      }
    };

  if (
    !isOpen ||
    !roomType
  ) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-2xl p-6">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-xl font-bold">

            Edit Room Type

          </h2>

          <button
            onClick={onClose}
            className="text-gray-500"
          >
            ✕
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* NAME */}

          <div>

            <label className="block mb-1 font-medium">

              Name

            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              className="w-full border rounded-lg p-3"
            />

          </div>

          {/* IMAGE */}

          <div>

            <label className="block mb-1 font-medium">

              Image

            </label>

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
            />

          </div>

          {/* PREVIEW */}

          {preview && (

            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 rounded-lg object-cover"
            />

          )}

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-lg"
            >
              Update
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}