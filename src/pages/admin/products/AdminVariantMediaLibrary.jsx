import "../../../styles/adminvariantmedialibrary.css";

import Cropper from "react-easy-crop";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  Upload,
  ImagePlus,
  Trash2,
  Star,
  Grid3X3,
  List,
  ZoomIn,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";

import {
  getAdminProductDetail,
  uploadVariantImage,
  deleteVariantImage,
} from "../../../features/catalog/product/productSlice";

export default function AdminVariantMediaLibrary() {

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const fileInputRef =
    useRef(null);

  const {
    productId,
    variantId,
  } = useParams();

  // ==========================================
  // STATE
  // ==========================================

  const [
    dragActive,
    setDragActive,
  ] = useState(false);

  const [
    selectedImages,
    setSelectedImages,
  ] = useState([]);

  const [
    uploadError,
    setUploadError,
  ] = useState("");

  const [
    uploadLoading,
    setUploadLoading,
  ] = useState(false);

  const [
    viewMode,
    setViewMode,
  ] = useState("grid");

  const [
    zoomedImage,
    setZoomedImage,
  ] = useState(null);

  // ==========================================
  // CROPPER
  // ==========================================

  const [
    crop,
    setCrop,
  ] = useState({
    x: 0,
    y: 0,
  });

  const [
    zoom,
    setZoom,
  ] = useState(1);

  const [
    croppedAreaPixels,
    setCroppedAreaPixels,
  ] = useState(null);

  const [
    currentCropImage,
    setCurrentCropImage,
  ] = useState(null);

  // ==========================================
  // REDUX
  // ==========================================

  const {
    productDetail,
    productLoading,
  } = useSelector(
    (state) => state.product
  );

  // ==========================================
  // FETCH
  // ==========================================

  useEffect(() => {

    if (productId) {

      dispatch(
        getAdminProductDetail(
          productId
        )
      );
    }

  }, [
    dispatch,
    productId,
  ]);

  // ==========================================
  // FIND VARIANT
  // ==========================================

  const variant =
    productDetail?.variants?.find(
      (item) =>
        String(item.id) ===
        String(variantId)
    );

  // ==========================================
  // CROP COMPLETE
  // ==========================================

  const onCropComplete =
    (
      croppedArea,
      croppedAreaPixels
    ) => {

      setCroppedAreaPixels(
        croppedAreaPixels
      );
    };

  // ==========================================
  // VALIDATE FILES
  // ==========================================

  const validateFiles =
    (files) => {

      const validFiles = [];

      for (const file of files) {

        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          setUploadError(
            "Only image files allowed"
          );

          continue;
        }

        if (
          file.size >
          5 * 1024 * 1024
        ) {

          setUploadError(
            "Each image must be below 5MB"
          );

          continue;
        }

        validFiles.push(file);
      }

      return validFiles;
    };

  // ==========================================
  // HANDLE FILES
  // ==========================================

  const handleFiles =
    (files) => {

      setUploadError("");

      const validated =
        validateFiles(
          Array.from(files)
        );

      if (
        validated.length === 0
      ) {
        return;
      }

      const previews =
        validated.map(
          (file) => ({

            id:
              crypto.randomUUID(),

            file,

            preview:
              URL.createObjectURL(
                file
              ),

            name:
              file.name,

            size:
              (
                file.size /
                1024 /
                1024
              ).toFixed(2),
          })
        );

      setSelectedImages(
        (prev) => [
          ...prev,
          ...previews,
        ]
      );

      setCurrentCropImage(
        previews[0]
      );
    };

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  const removeSelectedImage =
    (id) => {

      setSelectedImages(
        (prev) =>

          prev.filter(
            (item) =>
              item.id !== id
          )
      );
    };

  // ==========================================
  // SAVE IMAGES
  // ==========================================

  const handleSaveImages =
    async () => {

      setUploadError("");

      if (
        selectedImages.length < 3
      ) {

        setUploadError(
          "Minimum 3 images required"
        );

        return;
      }

      try {

        setUploadLoading(true);

        const files =
          selectedImages.map(
            (item) => item.file
          );

        await dispatch(

          uploadVariantImage({

            variant:
              variant.id,

            images: files,
          })

        ).unwrap();

        await dispatch(
          getAdminProductDetail(
            productId
          )
        );

        setSelectedImages([]);

      } catch (error) {

        console.error(error);

        setUploadError(

          error?.error ||

          error?.detail ||

          "Upload failed"
        );

      } finally {

        setUploadLoading(false);
      }
    };

  // ==========================================
  // DROP
  // ==========================================

  const handleDrop = (
    e
  ) => {

    e.preventDefault();

    setDragActive(false);

    handleFiles(
      e.dataTransfer.files
    );
  };

  // ==========================================
  // DELETE IMAGE
  // ==========================================

  const handleDelete =
    (imageId) => {

      dispatch(
        deleteVariantImage(
          imageId
        )
      );
    };

  // ==========================================
  // LOADING
  // ==========================================

  if (
    productLoading ||
    !variant
  ) {

    return (

      <div className="media-loading">

        Loading media library...

      </div>
    );
  }

  return (

    <div className="variant-media-page">

      {/* HEADER */}

      <div className="media-header">

        <div>

          <button
            className="back-btn"
            onClick={() =>
              navigate(-1)
            }
          >

            <ArrowLeft size={18} />

            Back

          </button>

          <h1>

            Variant Media

          </h1>

          <p>

            Manage gallery imagery for

            {" "}

            {variant.variant_name}

          </p>

        </div>

        <div className="media-header-actions">

          <button
            className={
              viewMode === "grid"

                ? "view-btn active"

                : "view-btn"
            }
            onClick={() =>
              setViewMode("grid")
            }
          >

            <Grid3X3 size={18} />

          </button>

          <button
            className={
              viewMode === "list"

                ? "view-btn active"

                : "view-btn"
            }
            onClick={() =>
              setViewMode("list")
            }
          >

            <List size={18} />

          </button>

        </div>

      </div>

      {/* UPLOAD */}

      <div

        className={

          dragActive

            ? "upload-zone active"

            : "upload-zone"
        }

        onDragOver={(e) => {

          e.preventDefault();

          setDragActive(true);
        }}

        onDragLeave={() =>
          setDragActive(false)
        }

        onDrop={handleDrop}

        onClick={() =>
          fileInputRef.current.click()
        }
      >

        <input
          type="file"
          multiple
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) =>
            handleFiles(
              e.target.files
            )
          }
        />

        <div className="upload-icon">

          <ImagePlus size={34} />

        </div>

        <h3>

          Drop images here

        </h3>

        <p>

          PNG, JPG, WEBP up to 5MB

        </p>

        <button className="browse-btn">

          <Upload size={16} />

          Browse Files

        </button>

      </div>

      {/* ERROR */}

      {
        uploadError && (

          <div className="upload-error">

            {uploadError}

          </div>
        )
      }

      {/* PREVIEW */}

      {
        selectedImages.length > 0 && (

          <div className="selected-preview-section">

            <div className="selected-preview-header">

              <h2>

                Selected Images

              </h2>

              <button
                className="save-images-btn"
                onClick={
                  handleSaveImages
                }
                disabled={
                  uploadLoading
                }
              >

                <Save size={18} />

                {
                  uploadLoading

                    ? "Uploading..."

                    : "Save Images"
                }

              </button>

            </div>

            <div className="preview-grid">

              {
                selectedImages.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="preview-card"
                    >

                      <img
                        src={
                          item.preview
                        }
                        alt=""
                      />

                      <div className="preview-overlay">

                        <button
                          onClick={() =>
                            setZoomedImage(
                              item.preview
                            )
                          }
                        >

                          <ZoomIn size={18} />

                        </button>

                        <button
                          onClick={() =>
                            setCurrentCropImage(
                              item
                            )
                          }
                        >

                          Crop

                        </button>

                        <button
                          onClick={() =>
                            removeSelectedImage(
                              item.id
                            )
                          }
                        >

                          <X size={18} />

                        </button>

                      </div>

                      <div className="preview-info">

                        <p>
                          {item.name}
                        </p>

                        <small>
                          {item.size}
                          MB
                        </small>

                      </div>

                    </div>
                  )
                )
              }

            </div>

          </div>
        )
      }

      {/* EXISTING IMAGES */}

      <div
        className={

          viewMode === "grid"

            ? "media-grid"

            : "media-list"
        }
      >

        {
          variant.images?.map(
            (image) => (

              <div
                key={image.id}
                className="media-card"
              >

                <div className="media-image-wrapper">

                  <img
                    src={
                      image.image_url ||
                      image.image
                    }
                    alt=""
                    className="media-image"
                  />

                  {
                    image.is_primary && (

                      <div className="primary-badge">

                        <Star size={12} />

                        Featured

                      </div>
                    )
                  }

                </div>

                <div className="media-info">

                  <div>

                    <h4>

                      Variant Image

                    </h4>

                  </div>

                  <div className="media-actions">

                    <button
                      onClick={() =>
                        setZoomedImage(
                          image.image_url ||
                          image.image
                        )
                      }
                    >

                      <ZoomIn
                        size={18}
                      />

                    </button>

                    <button
                      className="delete-image-btn"
                      onClick={() =>
                        handleDelete(
                          image.id
                        )
                      }
                    >

                      <Trash2
                        size={18}
                      />

                    </button>

                  </div>

                </div>

              </div>
            )
          )
        }

      </div>

      {/* CROP MODAL */}

      {
        currentCropImage && (

          <div className="crop-modal-overlay">

            <div className="crop-modal">

              <div className="crop-container">

                <Cropper
                  image={
                    currentCropImage.preview
                  }
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={
                    setCrop
                  }
                  onZoomChange={
                    setZoom
                  }
                  onCropComplete={
                    onCropComplete
                  }
                />

              </div>

              <div className="crop-controls">

                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) =>
                    setZoom(
                      e.target.value
                    )
                  }
                />

                <button
                  className="crop-close-btn"
                  onClick={() =>
                    setCurrentCropImage(
                      null
                    )
                  }
                >

                  Done

                </button>

              </div>

            </div>

          </div>
        )
      }

      {/* ZOOM */}

      {
        zoomedImage && (

          <div
            className="zoom-overlay"
            onClick={() =>
              setZoomedImage(
                null
              )
            }
          >

            <img
              src={zoomedImage}
              alt=""
              className="zoomed-image"
            />

          </div>
        )
      }

    </div>
  );
}