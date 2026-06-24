// src/app/app/(authenticated)/content/_shared/GalleryManager.tsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { isBlobSrc } from "@/lib/cms/image-src";
import {
  useGallery,
  addGalleryImage,
  updateGalleryImage,
  removeGalleryImage,
  moveGalleryImage,
  GALLERY_MIN,
  GALLERY_MAX,
} from "@/lib/cms/gallery";

/**
 * Editor for the shared marketing gallery. Used by both the Homepage and About
 * CMS pages — they edit the same underlying store.
 */
export default function GalleryManager() {
  const gallery = useGallery();
  const fileRef = useRef<HTMLInputElement>(null);

  const atMin = gallery.length <= GALLERY_MIN;
  const atMax = gallery.length >= GALLERY_MAX;

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addGalleryImage({ src: URL.createObjectURL(file), alt: "" });
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          Shared by the homepage &amp; about carousels.{" "}
          <span className="font-semibold text-ink">
            {gallery.length}/{GALLERY_MAX}
          </span>{" "}
          images (min {GALLERY_MIN}).
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={atMax}
          className="inline-flex items-center gap-2 rounded-sm bg-brand px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-foreground transition hover:bg-brand-hover disabled:opacity-40 disabled:pointer-events-none"
        >
          <Plus size={12} />
          Add Image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleAddFile}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((img, i) => (
          <div
            key={img.id}
            className="overflow-hidden rounded-sm border border-ink/10 bg-paper"
          >
            <div className="relative aspect-[4/3] bg-paper-soft">
              <Image
                src={img.src}
                alt={img.alt || "Gallery image"}
                fill
                unoptimized={isBlobSrc(img.src)}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <span className="absolute left-2 top-2 rounded-sm bg-ink/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-paper">
                {i + 1}
              </span>
            </div>
            <div className="space-y-3 p-3">
              <Input
                label="Alt text"
                value={img.alt}
                onChange={(e) =>
                  updateGalleryImage(img.id, { alt: e.target.value })
                }
                placeholder="Describe the image"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveGalleryImage(img.id, -1)}
                    disabled={i === 0}
                    aria-label="Move left"
                    className="rounded-sm border border-ink/15 p-1.5 text-ink transition hover:bg-paper-soft disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveGalleryImage(img.id, 1)}
                    disabled={i === gallery.length - 1}
                    aria-label="Move right"
                    className="rounded-sm border border-ink/15 p-1.5 text-ink transition hover:bg-paper-soft disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeGalleryImage(img.id)}
                  disabled={atMin}
                  title={atMin ? `Minimum ${GALLERY_MIN} images` : "Remove"}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest transition",
                    "bg-brand text-brand-foreground hover:bg-brand-hover",
                    "disabled:opacity-40 disabled:pointer-events-none",
                  )}
                >
                  <Trash2 size={12} />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
