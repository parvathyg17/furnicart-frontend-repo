import { useCallback, useEffect, useRef, useState } from "react";

import {
  ZOOM_SCALE_MAX,
  ZOOM_SCALE_MIN,
  clampPanForScale,
} from "./productDetailUtils.js";

export default function useProductImageZoom(primaryImage) {
  const zoomViewportRef = useRef(null);

  const imageZoomRef = useRef({
    scale: 1,
    panX: 0,
    panY: 0,
  });

  const [imageZoom, setImageZoom] = useState({
    scale: 1,
    panX: 0,
    panY: 0,
  });

  const imageDragRef = useRef(null);

  imageZoomRef.current = imageZoom;

  useEffect(() => {
    setImageZoom({
      scale: 1,
      panX: 0,
      panY: 0,
    });

    imageDragRef.current = null;
  }, [primaryImage]);

  useEffect(() => {
    const el = zoomViewportRef.current;

    if (!el || !primaryImage) {
      return;
    }

    const onWheel = (e) => {
      if (e.ctrlKey) {
        return;
      }

      e.preventDefault();

      const rect = el.getBoundingClientRect();

      const vw = rect.width;

      const vh = rect.height;

      const factor = e.deltaY < 0 ? 1.08 : 1 / 1.08;

      setImageZoom((z) => {
        const raw = Math.min(
          ZOOM_SCALE_MAX,
          Math.max(ZOOM_SCALE_MIN, z.scale * factor),
        );

        if (raw <= 1.001) {
          return {
            scale: 1,
            panX: 0,
            panY: 0,
          };
        }

        const nextScale = Math.max(1.02, raw);

        return {
          scale: nextScale,

          ...clampPanForScale(nextScale, z.panX, z.panY, vw, vh),
        };
      });
    };

    el.addEventListener("wheel", onWheel, {
      passive: false,
    });

    return () => el.removeEventListener("wheel", onWheel);
  }, [primaryImage]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setImageZoom({
          scale: 1,
          panX: 0,
          panY: 0,
        });

        imageDragRef.current = null;
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onImagePointerDown = useCallback(
    (e) => {
      const z = imageZoomRef.current;

      if (z.scale <= 1) {
        return;
      }

      imageDragRef.current = {
        id: e.pointerId,

        lx: e.clientX,

        ly: e.clientY,

        ox: z.panX,

        oy: z.panY,
      };

      e.currentTarget.setPointerCapture(e.pointerId);
    },

    [],
  );

  const onImagePointerMove = useCallback(
    (e) => {
      const d = imageDragRef.current;

      if (!d || d.id !== e.pointerId) {
        return;
      }

      const el = zoomViewportRef.current;

      if (!el) return;

      const rect = el.getBoundingClientRect();

      const panX = d.ox + (e.clientX - d.lx);

      const panY = d.oy + (e.clientY - d.ly);

      const scale = imageZoomRef.current.scale;

      const clamped = clampPanForScale(
        scale,
        panX,
        panY,
        rect.width,
        rect.height,
      );

      setImageZoom({
        scale,

        ...clamped,
      });
    },

    [],
  );

  const onImagePointerUp = useCallback(
    (e) => {
      if (imageDragRef.current?.id === e.pointerId) {
        imageDragRef.current = null;
      }
    },

    [],
  );

  const onImageDoubleClick = useCallback(() => {
    setImageZoom({
      scale: 1,
      panX: 0,
      panY: 0,
    });

    imageDragRef.current = null;
  }, []);

  return {
    zoomViewportRef,
    imageZoom,
    onImagePointerDown,
    onImagePointerMove,
    onImagePointerUp,
    onImageDoubleClick,
  };
}
