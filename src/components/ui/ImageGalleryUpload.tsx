"use client";

import { useRef, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { uploadImage, deleteUploadedImage } from "@/lib/uploadImage";

interface ImageGalleryUploadProps {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  error?: string;
  helpText?: string;
  maxImages?: number;
}

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_FILE_SIZE_MB = 5;

/** Multiple-image picker — used for a design's full set of catalog photos. */
export default function ImageGalleryUpload({
  label,
  value,
  onChange,
  error,
  helpText,
  maxImages = 8,
}: ImageGalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setLocalError(null);

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      setLocalError(`You can add up to ${maxImages} photos`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setLocalError(`Each image must be under ${MAX_FILE_SIZE_MB}MB`);
          continue;
        }
        const { url } = await uploadImage(file);
        uploaded.push(url);
      }
      if (uploaded.length) onChange([...value, ...uploaded]);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not upload one or more images");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (url: string) => {
    void deleteUploadedImage(url);
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}

      <div className="flex flex-wrap gap-3">
        {value.map((url) => (
          <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Design photo" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              title="Remove photo"
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <FiX size={12} />
            </button>
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={`flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed
              text-ink-muted hover:border-primary hover:text-primary
              ${error ? "border-danger" : "border-border"}`}
          >
            <FiPlus size={18} />
            <span className="text-caption">{isUploading ? "Uploading..." : "Add photo"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {helpText && !(error || localError) && <p className="mt-1.5 text-caption text-ink-muted">{helpText}</p>}
      {(error || localError) && <p className="mt-1.5 text-caption text-danger">{error || localError}</p>}
    </div>
  );
}
