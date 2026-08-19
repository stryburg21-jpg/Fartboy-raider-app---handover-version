import { useEffect, useRef, useState } from "react";

interface CropInset {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface LumaKeyVideoFrameProps {
  videoSrc: string;
  fallbackImageSrc: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  /** Pixels darker than this (0-255 luma) are treated as the "hole" and made transparent. */
  threshold?: number;
  /**
   * Normalized 0-1 fractions of built-in letterbox padding baked into the
   * source asset, cropped away *before* stretching to fill the container.
   *
   * These overlay assets are exported on a fixed 9:16 canvas, but the actual
   * border artwork only occupies a smaller centered rectangle within it
   * (frame-a-dragon has ~17% dead space top/bottom, ~4% left/right - same
   * bounding box in both the .mp4 and the .png, measured directly from the
   * files). Stretching the raw, un-cropped asset to fill a card of a
   * different aspect ratio leaves the border "floating" with gaps top/bottom
   * instead of hugging the card edges. Measure your source asset's actual
   * border bounding box and set these per-frame if you add new cosmetics.
   */
  cropInset?: CropInset;
}

const DEFAULT_CROP_INSET: CropInset = { left: 0, top: 0, right: 0, bottom: 0 };

function cropRect(sourceW: number, sourceH: number, cropInset: CropInset) {
  const x = cropInset.left * sourceW;
  const y = cropInset.top * sourceH;
  const w = sourceW - x - cropInset.right * sourceW;
  const h = sourceH - y - cropInset.bottom * sourceH;
  return { x, y, w, h };
}

/**
 * Renders a frame cosmetic that has a pure-black "hole" cut into it (e.g.
 * frame-a-dragon.mp4/.png) as a genuinely transparent, edge-to-edge overlay.
 *
 * Two problems this solves, both visible as "the frame covers/misaligns with
 * the character card":
 *
 * 1. TRANSPARENCY: `mix-blend-mode: screen` directly on a <video> element is
 *    unreliable across browsers - it does not work at all on <video> in
 *    Safari/iOS, and can silently be skipped in Chrome when the video
 *    decodes via a hardware overlay path. Either way the black "hole"
 *    renders as solid opaque black instead of blending away. We avoid this
 *    entirely by drawing each frame onto a <canvas> and manually zeroing the
 *    alpha channel on near-black pixels ("luma keying") - this works
 *    identically in every browser.
 *
 * 2. ALIGNMENT: the source asset is exported on a fixed 9:16 canvas with a
 *    lot of dead black space above/below the actual border artwork. Naively
 *    stretching that whole canvas with object-fit to a card of a different
 *    aspect ratio leaves the visible border floating away from the card
 *    edges. We fix this by cropping to the artwork's real bounding box
 *    (`cropInset`) before scaling it up to fill the container, for both the
 *    live video and the static PNG fallback.
 */
export function LumaKeyVideoFrame({
  videoSrc,
  fallbackImageSrc,
  alt,
  className,
  style,
  threshold = 24,
  cropInset = DEFAULT_CROP_INSET,
}: LumaKeyVideoFrameProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [failed, setFailed] = useState(false);

  // The canvas's *drawing buffer* is intentionally kept in lockstep with its
  // actual on-screen CSS pixel size (via ResizeObserver), and we draw the
  // cropped source directly at that size with ctx.drawImage's destination
  // rect. This is deliberate: `object-fit` on <canvas> has inconsistent
  // cross-browser support (notably older Safari/WebViews), so relying on it
  // to stretch a canvas whose buffer is sized to the *source's* native
  // resolution can leave the artwork looking inset from the container edges
  // on some devices. Matching the buffer to the container means there is no
  // CSS scaling left to do - the canvas is always genuinely edge-to-edge.
  const sizeRef = useRef({ width: 0, height: 0 });

  // Reset error state whenever the equipped frame's video source changes
  // (e.g. player swaps to a different HQ Frame cosmetic).
  useEffect(() => {
    setFailed(false);
  }, [videoSrc]);

  // Track the canvas's real rendered size so the drawing buffer can match it
  // 1:1 (times devicePixelRatio for crisp edges on high-DPI screens).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = {
        width: Math.max(1, Math.round(rect.width * dpr)),
        height: Math.max(1, Math.round(rect.height * dpr)),
      };
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Live video path: decode frames into the hidden <video>, crop + luma-key
  // each one onto the visible <canvas> every animation frame.
  useEffect(() => {
    if (failed) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let cancelled = false;

    const draw = () => {
      if (cancelled) return;
      if (video.videoWidth && video.videoHeight) {
        const { width: targetW, height: targetH } = sizeRef.current;
        if (targetW && targetH) {
          if (canvas.width !== targetW || canvas.height !== targetH) {
            canvas.width = targetW;
            canvas.height = targetH;
          }
          const src = cropRect(video.videoWidth, video.videoHeight, cropInset);
          ctx.drawImage(video, src.x, src.y, src.w, src.h, 0, 0, canvas.width, canvas.height);

          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = frame.data;
          for (let i = 0; i < data.length; i += 4) {
            // Perceived brightness. Near-black "hole" pixels become fully
            // transparent; the gold/gem border artwork stays opaque.
            const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            if (luma < threshold) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(frame, 0, 0);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [failed, threshold, videoSrc, cropInset]);

  // Fallback path (video failed to load): draw the PNG once, applying the
  // same crop. No luma-key needed here since the PNG already carries real
  // alpha transparency in its hole - just crop-then-stretch to match.
  useEffect(() => {
    if (!failed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const { width: targetW, height: targetH } = sizeRef.current;
      canvas.width = targetW || img.naturalWidth;
      canvas.height = targetH || img.naturalHeight;
      const src = cropRect(img.naturalWidth, img.naturalHeight, cropInset);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, src.x, src.y, src.w, src.h, 0, 0, canvas.width, canvas.height);
    };
    img.src = fallbackImageSrc;
    return () => {
      cancelled = true;
    };
  }, [failed, fallbackImageSrc, cropInset]);

  return (
    <>
      {!failed && (
        // Hidden decode source - its frames are painted onto the visible canvas below.
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="hidden"
          onError={() => setFailed(true)}
        />
      )}
      <canvas ref={canvasRef} aria-label={alt} className={className} style={style} />
    </>
  );
}
