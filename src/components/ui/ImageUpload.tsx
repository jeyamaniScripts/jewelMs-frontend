"use client";

import { useRef } from "react";
import { FiUpload, FiX, FiUser, FiImage } from "react-icons/fi";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  shape?: "circle" | "square";
  helpText?: string;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  shape = "square",
  helpText = "PNG or JPG, up to 2MB.",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-xl";
  const PlaceholderIcon = shape === "circle" ? FiUser : FiImage;

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      // Kept simple — a toast/inline error would be a nice follow-up.
      alert("Image is too large. Please choose a file under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-border bg-surface-tint text-ink-muted ${shapeClass}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <PlaceholderIcon size={22} />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink hover:border-primary hover:text-primary"
            >
              <FiUpload size={14} /> Upload
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-muted hover:border-danger hover:text-danger"
              >
                <FiX size={14} /> Remove
              </button>
            )}
          </div>
          <p className="text-caption text-ink-muted">{helpText}</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}
