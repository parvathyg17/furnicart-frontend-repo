import {
  useState,
} from "react";

import {
  useDispatch,
} from "react-redux";

import {

  createRoomType,

} from "../../../features/catalog/catalogSlice";

export default function CreateRoomTypeModal({

  isOpen,
  onClose,

}) {

  const dispatch = useDispatch();

  const [name, setName] =
    useState("");

  const [image, setImage] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

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

        setName("");

        setImage(null);

        setPreview(null);

        onClose();
      }
    };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-2xl p-6">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-xl font-bold">

            Create Room Type

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
              Create
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}