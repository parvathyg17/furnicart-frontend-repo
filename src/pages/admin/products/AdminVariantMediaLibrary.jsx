import "../../../styles/adminvariantmedialibrary.css";

import Cropper from "react-easy-crop";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
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
  Crop,
  RotateCw,
  ZoomOut,
  RefreshCw,
} from "lucide-react";

import {
  getAdminProductDetail,
  uploadVariantImage,
  deleteVariantImage,
} from "../../../features/catalog/product/productSlice";

import {
  formatProductApiError,
} from "../../../utils/productApiErrors.js";



const createImage = (url) =>
  new Promise((resolve, reject) => {

    const image = new Image();

    image.addEventListener(
      "load",
      () => resolve(image)
    );

    image.addEventListener(
      "error",
      reject
    );

    image.src = url;
  });



async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0
) {

  const image =
    await createImage(imageSrc);

  const canvas =
    document.createElement("canvas");

  const ctx =
    canvas.getContext("2d");

  const safeArea =
    Math.max(
      image.width,
      image.height
    ) * 2;

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(
    safeArea / 2,
    safeArea / 2
  );

  ctx.rotate(
    (rotation * Math.PI) / 180
  );

  ctx.translate(
    -safeArea / 2,
    -safeArea / 2
  );

  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2
  );

  const data =
    ctx.getImageData(
      0,
      0,
      safeArea,
      safeArea
    );

  canvas.width =
    pixelCrop.width;

  canvas.height =
    pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(
      0 -
        safeArea / 2 +
        image.width / 2 -
        pixelCrop.x
    ),
    Math.round(
      0 -
        safeArea / 2 +
        image.height / 2 -
        pixelCrop.y
    )
  );

  return new Promise((resolve) => {

    canvas.toBlob(
      (blob) => {

        const file =
          new File(
            [blob],
            `cropped-${Date.now()}.jpg`,
            {
              type:
                "image/jpeg",
            }
          );

        resolve({
          file,
          preview:
            URL.createObjectURL(blob),
        });

      },
      "image/jpeg",
      0.92
    );
  });
}

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
    rotation,
    setRotation,
  ] = useState(0);

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
    useCallback(

      (
        croppedArea,
        croppedAreaPixels
      ) => {

        setCroppedAreaPixels(
          croppedAreaPixels
        );
      },

      []
    );

  // ==========================================
  // APPLY CROP
  // ==========================================

  const applyCrop =
    async () => {

      try {

        const cropped =
          await getCroppedImg(

            currentCropImage.preview,

            croppedAreaPixels,

            rotation
          );

        setSelectedImages(
          (prev) =>

            prev.map((item) =>

              item.id ===
              currentCropImage.id

                ? {

                    ...item,

                    file:
                      cropped.file,

                    preview:
                      cropped.preview,
                  }

                : item
            )
        );

        setCurrentCropImage(
          null
        );

      } catch (error) {

        console.error(error);

        setUploadError(
          "Crop failed"
        );
      }
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

          formatProductApiError(error) ||

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
    async (imageId) => {

      setUploadError("");

      try {

        await dispatch(
          deleteVariantImage(
            imageId
          )
        ).unwrap();
      } catch (payload) {

        setUploadError(
          formatProductApiError(
            payload
          ) ||

            "Failed to delete image"
        );
      }
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

            Manage gallery imagery for{" "}

            {
              variant.variant_name
            }

          </p>

          <p className="media-minimum-hint">

            Each active variant must have at least three images saved
            before the product can go live. Currently saved on this
            variant:{" "}

            {
              variant.images?.length || 0
            }

            {" "}/ 3

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

                          <Crop size={18} />

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

            {/* TOP BAR */}

            <div className="crop-topbar">

              <div className="crop-title-section">

                <h2>
                  Edit Image
                </h2>

                <p>
                  Adjust image position and framing
                </p>

              </div>

              <div className="crop-topbar-actions">

                <button
                  className="crop-toolbar-btn"
                  onClick={() => {

                    setZoom(1);

                    setRotation(0);

                    setCrop({
                      x: 0,
                      y: 0,
                    });
                  }}
                >

                  <RefreshCw size={18} />

                </button>

                <button
                  className="crop-toolbar-btn"
                  onClick={() =>
                    setRotation(
                      (prev) =>
                        prev - 90
                    )
                  }
                >

                  <RotateCw
                    size={18}
                    style={{
                      transform:
                        "scaleX(-1)",
                    }}
                  />

                </button>

                <button
                  className="crop-toolbar-btn"
                  onClick={() =>
                    setRotation(
                      (prev) =>
                        prev + 90
                    )
                  }
                >

                  <RotateCw size={18} />

                </button>

                <button
                  className="crop-toolbar-btn"
                  onClick={() =>
                    setZoom(
                      (prev) =>
                        Math.max(
                          prev - 0.2,
                          1
                        )
                    )
                  }
                >

                  <ZoomOut size={18} />

                </button>

                <button
                  className="crop-toolbar-btn"
                  onClick={() =>
                    setZoom(
                      (prev) =>
                        Math.min(
                          prev + 0.2,
                          3
                        )
                    )
                  }
                >

                  <ZoomIn size={18} />

                </button>

                <button
                  className="crop-close-btn"
                  onClick={() =>
                    setCurrentCropImage(
                      null
                    )
                  }
                >

                  <X size={18} />

                </button>

                <button
                  className="crop-apply-btn"
                  onClick={applyCrop}
                >

                  Apply

                </button>

              </div>

            </div>

            {/* CROPPER */}

            <div className="crop-area">

              <Cropper
                image={
                  currentCropImage.preview
                }
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={
                  setCrop
                }
                onZoomChange={
                  setZoom
                }
                onRotationChange={
                  setRotation
                }
                onCropComplete={
                  onCropComplete
                }
              />

            </div>

          </div>

        </div>
      )
    }

      {
    zoomedImage && (

      <div
        className="zoom-overlay"
        onClick={() =>
          setZoomedImage(null)
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