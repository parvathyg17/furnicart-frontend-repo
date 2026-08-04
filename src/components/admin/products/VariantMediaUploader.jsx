import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Upload,
  ImagePlus,
  Trash2,
  Star,
  ZoomIn,
  X,
  Crop,
  RotateCw,
  ZoomOut,
  RefreshCw,
} from "lucide-react";
import "../../../styles/adminvariantmedialibrary.css";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", reject);
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const safeArea = Math.max(image.width, image.height) * 2;
  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2,
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y),
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `cropped-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        resolve({
          file,
          preview: URL.createObjectURL(blob),
        });
      },
      "image/jpeg",
      0.92,
    );
  });
}

export default function VariantMediaUploader({
  existingImages = [],
  onDeleteExistingImage,
  selectedImages = [],
  setSelectedImages,
  isEditMode = false,
  onSaveNewImages,
  uploadLoading = false,
}) {
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [zoomedImage, setZoomedImage] = useState(null);

  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [currentCropImage, setCurrentCropImage] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const applyCrop = async () => {
    try {
      const cropped = await getCroppedImg(
        currentCropImage.preview,
        croppedAreaPixels,
        rotation,
      );

      setSelectedImages((prev) =>
        prev.map((item) =>
          item.id === currentCropImage.id
            ? { ...item, file: cropped.file, preview: cropped.preview }
            : item,
        ),
      );
      setCurrentCropImage(null);
    } catch (error) {
      console.error(error);
      setUploadError("Crop failed");
    }
  };

  const validateFiles = (files) => {
    const validFiles = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Only image files allowed");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Each image must be below 5MB");
        continue;
      }
      validFiles.push(file);
    }
    return validFiles;
  };

  const handleFiles = (files) => {
    setUploadError("");
    const validated = validateFiles(Array.from(files));
    if (validated.length === 0) return;

    const previews = validated.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
    }));

    setSelectedImages((prev) => [...prev, ...previews]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeSelectedImage = (id) => {
    setSelectedImages((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="variant-media-uploader" style={{ marginTop: "24px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600",
          fontSize: "12px",
          color: "#6b7280",
        }}
      >
        VARIANT IMAGES
      </label>

      {/* UPLOAD ZONE */}
      <div
        className={dragActive ? "upload-zone active" : "upload-zone"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        style={{ cursor: "pointer" }}
      >
        <input
          type="file"
          multiple
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="upload-icon">
          <ImagePlus size={34} />
        </div>
        <h3 style={{ margin: "8px 0", fontSize: "16px" }}>Drop images here</h3>
        <p style={{ margin: 0, fontSize: "14px" }}>PNG, JPG, WEBP up to 5MB</p>
        <button
          type="button"
          className="browse-btn"
          style={{ marginTop: "16px" }}
        >
          <Upload size={16} /> Browse Files
        </button>
      </div>

      {uploadError && <div className="upload-error">{uploadError}</div>}

      {/* SELECTED IMAGES PREVIEW */}
      {selectedImages.length > 0 && (
        <div className="selected-preview-section" style={{ marginTop: "24px" }}>
          <div
            className="selected-preview-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "16px", margin: 0 }}>
              Selected Images (To Upload)
            </h2>
            {onSaveNewImages && (
              <button
                type="button"
                className="save-images-btn"
                onClick={onSaveNewImages}
                disabled={uploadLoading}
              >
                {uploadLoading ? "Uploading..." : "Upload Selected"}
              </button>
            )}
          </div>
          <div
            className="preview-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "16px",
            }}
          >
            {selectedImages.map((item) => (
              <div
                key={item.id}
                className="preview-card"
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                }}
              >
                <img
                  src={item.preview}
                  alt=""
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  className="preview-overlay"
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setZoomedImage(item.preview)}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      background: "rgba(17,24,39,0.8)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentCropImage(item)}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      background: "rgba(17,24,39,0.8)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Crop size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSelectedImage(item.id)}
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXISTING IMAGES (For Edit Mode) */}
      {isEditMode && existingImages.length > 0 && (
        <div className="existing-preview-section" style={{ marginTop: "32px" }}>
          <h2
            style={{ fontSize: "16px", margin: "0 0 16px 0", color: "#111827" }}
          >
            Existing Images
          </h2>
          <div
            className="preview-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "16px",
            }}
          >
            {existingImages.map((image) => (
              <div
                key={image.id}
                className="preview-card"
                style={{
                  position: "relative",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                }}
              >
                <img
                  src={image.image_url || image.image}
                  alt=""
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {image.is_primary && (
                  <div
                    className="primary-badge"
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      padding: "4px 8px",
                      background: "rgba(17,24,39,0.9)",
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    <Star
                      size={10}
                      style={{ display: "inline", marginRight: "4px" }}
                    />
                    Featured
                  </div>
                )}
                <div
                  className="preview-overlay"
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setZoomedImage(image.image_url || image.image)
                    }
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      background: "rgba(17,24,39,0.8)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteExistingImage && onDeleteExistingImage(image.id)
                    }
                    style={{
                      padding: "6px",
                      borderRadius: "6px",
                      background: "#ef4444",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CROP MODAL */}
      {currentCropImage && (
        <div className="crop-modal-overlay">
          <div className="crop-modal">
            <div className="crop-topbar">
              <div className="crop-title-section">
                <h2>Edit Image</h2>
                <p>Adjust image position and framing</p>
              </div>
              <div className="crop-topbar-actions">
                <button
                  type="button"
                  className="crop-toolbar-btn"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setCrop({ x: 0, y: 0 });
                  }}
                >
                  <RefreshCw size={18} />
                </button>
                <button
                  type="button"
                  className="crop-toolbar-btn"
                  onClick={() => setRotation((prev) => prev - 90)}
                >
                  <RotateCw size={18} style={{ transform: "scaleX(-1)" }} />
                </button>
                <button
                  type="button"
                  className="crop-toolbar-btn"
                  onClick={() => setRotation((prev) => prev + 90)}
                >
                  <RotateCw size={18} />
                </button>
                <button
                  type="button"
                  className="crop-toolbar-btn"
                  onClick={() => setZoom((prev) => Math.max(prev - 0.2, 1))}
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  type="button"
                  className="crop-toolbar-btn"
                  onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  type="button"
                  className="crop-close-btn"
                  onClick={() => setCurrentCropImage(null)}
                >
                  <X size={18} />
                </button>
                <button
                  type="button"
                  className="crop-apply-btn"
                  onClick={applyCrop}
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="crop-area">
              <Cropper
                image={currentCropImage.preview}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>
          </div>
        </div>
      )}

      {/* ZOOM MODAL */}
      {zoomedImage && (
        <div className="zoom-overlay" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} alt="" className="zoomed-image" />
        </div>
      )}
    </div>
  );
}
