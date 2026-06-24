// src/components/app/ImageUploadField.tsx
"use client";

import { useId, useRef } from "react";
import Image from "next/image";
import { Upload, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { isBlobSrc } from "@/lib/cms/image-src";

interface ImageUploadFieldProps {
  label?: string;
  /** Current image src ("" when none). */
  value: string;
  /** Called with a fresh object URL when the user picks a file. */
  onChange: (src: string) => void;
  error?: string;
  /** Tailwind aspect-ratio class for the preview box. */
  aspectClassName?: string;
}

/**
 * Mock-phase image picker. A real upload endpoint would replace the
 * URL.createObjectURL call with an upload + returned URL — the value/onChange
 * contract stays identical.
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  error,
  aspectClassName = "aspect-[16/9]",
}: ImageUploadFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(URL.createObjectURL(file));
    // Allow re-picking the same file later.
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="font-display text-[11px] font-bold uppercase tracking-widest text-ink"
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-sm border border-ink/15 bg-paper-soft",
          aspectClassName,
          error && "border-brand",
        )}
      >
        {value ? (
          <Image
            src={value}
            alt={label ?? "Preview"}
            fill
            unoptimized={isBlobSrc(value)}
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 480px"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
            <ImageOff size={24} />
            <span className="text-[11px] font-bold uppercase tracking-widest">
              No image
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-2 right-2 inline-flex items-center gap-2 rounded-sm bg-ink/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-paper backdrop-blur transition hover:bg-ink"
        >
          <Upload size={12} />
          {value ? "Replace" : "Upload"}
        </button>
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {error && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          {error}
        </span>
      )}
    </div>
  );
}
