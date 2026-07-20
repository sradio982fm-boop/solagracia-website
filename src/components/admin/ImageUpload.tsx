"use client";

import { useState, useCallback } from "react";
import { adminUpload } from "@/lib/admin/api-client";
import { buildFocalUrl, parseFocalUrl } from "@/lib/focal-point";
import { sanitizeAssetSrc } from "@/lib/security";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket: string;
  subpath?: string;
  className?: string;
  aspectRatio?: "square" | "video" | "portrait" | "banner";
}

const ASPECT_CLASS = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  banner: "aspect-[4/1]",
} as const;

const ASPECT_RATIO_VALUE = {
  square: 1,
  video: 16 / 9,
  portrait: 3 / 4,
  banner: 4,
} as const;

export function ImageUpload({
  value,
  onChange,
  bucket,
  subpath,
  className,
  aspectRatio = "square",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

  const aspectClass = ASPECT_CLASS[aspectRatio];
  const targetRatio = ASPECT_RATIO_VALUE[aspectRatio];

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      if (file.size > 5 * 1024 * 1024) {
        setError("Maks 5MB");
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Format: jpg, png, webp");
        return;
      }

      setUploading(true);
      try {
        const result = await adminUpload(file, bucket, subpath);
        onChange(result.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload gagal");
      } finally {
        setUploading(false);
      }
    },
    [bucket, subpath, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const openFileDialog = useCallback(() => {
    document.getElementById(`upload-${bucket}`)?.click();
  }, [bucket]);

  const updateFocusFromPointer = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!value) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onChange(buildFocalUrl(value, { x, y }));
    },
    [value, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      updateFocusFromPointer(e);
    },
    [updateFocusFromPointer],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        updateFocusFromPointer(e);
      }
    },
    [updateFocusFromPointer],
  );

  const { cleanUrl: rawCleanUrl, focus } = parseFocalUrl(value);
  const cleanUrl = sanitizeAssetSrc(rawCleanUrl);

  // Crop window (object-cover) expressed as fractions of the displayed image,
  // so the admin sees exactly what will remain visible at the target ratio.
  const fx = focus.x / 100;
  const fy = focus.y / 100;
  let cropWidth = 1;
  let cropHeight = 1;
  if (naturalRatio) {
    if (naturalRatio >= targetRatio) {
      cropWidth = targetRatio / naturalRatio;
    } else {
      cropHeight = naturalRatio / targetRatio;
    }
  }
  const cropLeft = fx * (1 - cropWidth);
  const cropTop = fy * (1 - cropHeight);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors overflow-hidden",
          !value && aspectClass,
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          uploading && "opacity-50 pointer-events-none",
          !value && "cursor-pointer",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={value ? undefined : openFileDialog}
      >
        {value && cleanUrl ? (
          <div className="flex items-center justify-center bg-[#1a1a1f] p-2">
            {/* Wrapper sizes exactly to the displayed image so the crop overlay
                maps 1:1 — the full image is always shown, never cropped here. */}
            <div
              className="relative inline-block max-w-full cursor-crosshair touch-none select-none leading-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cleanUrl}
                alt="Preview"
                draggable={false}
                onLoad={(e) =>
                  setNaturalRatio(
                    e.currentTarget.naturalHeight
                      ? e.currentTarget.naturalWidth /
                          e.currentTarget.naturalHeight
                      : null,
                  )
                }
                className="block w-auto h-auto max-w-full max-h-[60vh] pointer-events-none"
              />
              {/* Visible crop window — area outside is dimmed */}
              <div
                aria-hidden
                style={{
                  left: `${cropLeft * 100}%`,
                  top: `${cropTop * 100}%`,
                  width: `${cropWidth * 100}%`,
                  height: `${cropHeight * 100}%`,
                  boxShadow: "0 0 0 9999px rgba(12,12,15,0.62)",
                }}
                className="absolute border-2 border-white pointer-events-none"
              >
                <span className="absolute inset-0 border border-black/30" />
                <span className="absolute top-1 left-1 rounded bg-white/90 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black">
                  Area tampil
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={openFileDialog}
              className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md bg-black/65 text-white text-xs font-medium px-2 py-1 hover:bg-black/85 transition-colors"
            >
              <i className="material-icons text-[14px]">photo_camera</i>
              Ganti
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground text-sm gap-1">
            <i className="material-icons text-[32px]">cloud_upload</i>
            <span>{uploading ? "Mengunggah..." : "Klik atau drop gambar"}</span>
          </div>
        )}
      </div>
      <input
        id={`upload-${bucket}`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />
      {value && (
        <p className="text-xs text-muted-foreground">
          Klik atau geser pada gambar untuk mengatur titik fokus. Kotak terang
          adalah bagian yang akan tampak saat gambar dipotong.
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
