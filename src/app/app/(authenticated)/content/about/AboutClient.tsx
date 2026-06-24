// src/app/app/(authenticated)/content/about/AboutClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Pencil } from "lucide-react";
import PageHeader from "@/components/app/PageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ImageUploadField from "@/components/app/ImageUploadField";
import { isBlobSrc } from "@/lib/cms/image-src";
import {
  useAboutContent,
  updateAboutContent,
  addFacility,
  updateFacility,
  removeFacility,
  type Facility,
} from "@/lib/cms/about";
import ContentSection from "../_shared/ContentSection";
import GalleryManager from "../_shared/GalleryManager";
import FacilityFormModal, { type FacilityFormValues } from "./FacilityFormModal";

export default function AboutClient() {
  const content = useAboutContent();

  const [facilityFormOpen, setFacilityFormOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [removingFacility, setRemovingFacility] = useState<Facility | null>(null);

  const setParagraph = (index: number, value: string) => {
    const next = content.paragraphs.map((p, i) => (i === index ? value : p));
    updateAboutContent({ paragraphs: next });
  };

  const addParagraph = () => {
    updateAboutContent({ paragraphs: [...content.paragraphs, ""] });
  };

  const removeParagraph = (index: number) => {
    updateAboutContent({
      paragraphs: content.paragraphs.filter((_, i) => i !== index),
    });
  };

  const handleFacilitySubmit = (values: FacilityFormValues) => {
    if (editingFacility) {
      updateFacility(editingFacility.id, values);
    } else {
      addFacility(values);
    }
    setFacilityFormOpen(false);
    setEditingFacility(null);
  };

  return (
    <>
      <PageHeader
        title="About"
        description="Edit the about-page profile, facilities, and gallery. Changes apply immediately."
      />

      <div className="space-y-6">
        <ContentSection
          title="Our Profile"
          description="Heading, body paragraphs, and the looping profile video."
        >
          <div className="space-y-4">
            <Input
              label="Heading"
              value={content.heading}
              onChange={(e) => updateAboutContent({ heading: e.target.value })}
              placeholder="e.g. Our Profile"
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
                  Paragraphs
                </span>
                <button
                  type="button"
                  onClick={addParagraph}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-brand px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-foreground transition hover:bg-brand-hover"
                >
                  <Plus size={12} />
                  Add Paragraph
                </button>
              </div>
              {content.paragraphs.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <textarea
                    value={p}
                    onChange={(e) => setParagraph(i, e.target.value)}
                    rows={3}
                    className="flex-1 rounded-sm border border-ink/15 bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors"
                    placeholder={`Paragraph ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeParagraph(i)}
                    disabled={content.paragraphs.length <= 1}
                    aria-label="Remove paragraph"
                    title={
                      content.paragraphs.length <= 1
                        ? "At least one paragraph is required"
                        : "Remove paragraph"
                    }
                    className="mt-1 rounded-sm border border-ink/15 p-2 text-ink transition hover:bg-paper-soft disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Input
                label="Video Source Path"
                value={content.videoSrc}
                onChange={(e) =>
                  updateAboutContent({ videoSrc: e.target.value })
                }
                placeholder="e.g. /videos/profile-loop.mp4"
              />
              <ImageUploadField
                label="Video Poster"
                value={content.videoPoster}
                onChange={(videoPoster) => updateAboutContent({ videoPoster })}
                aspectClassName="aspect-video"
              />
            </div>
          </div>
        </ContentSection>

        <ContentSection
          title="Facilities"
          description="The facility carousel shown on the about page."
        >
          <div className="mb-4 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setEditingFacility(null);
                setFacilityFormOpen(true);
              }}
            >
              <Plus size={14} />
              Add Facility
            </Button>
          </div>

          {content.facilities.length === 0 ? (
            <p className="py-8 text-center text-muted uppercase tracking-widest text-xs font-bold">
              No facilities yet
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {content.facilities.map((f) => (
                <div
                  key={f.id}
                  className="overflow-hidden rounded-sm border border-ink/10 bg-paper"
                >
                  <div className="relative aspect-[16/10] bg-paper-soft">
                    {f.image ? (
                      <Image
                        src={f.image}
                        alt={f.name}
                        fill
                        unoptimized={isBlobSrc(f.image)}
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted uppercase tracking-widest text-[10px] font-bold">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                      {f.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">{f.detail}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFacility(f);
                          setFacilityFormOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-accent-foreground transition hover:brightness-95"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setRemovingFacility(f)}
                        className="inline-flex items-center gap-1.5 rounded-sm bg-brand px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-foreground transition hover:bg-brand-hover"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ContentSection>

        <ContentSection
          title="Gallery"
          description="The carousel shown on the about page (shared with the homepage)."
        >
          <GalleryManager />
        </ContentSection>
      </div>

      <FacilityFormModal
        open={facilityFormOpen}
        onClose={() => {
          setFacilityFormOpen(false);
          setEditingFacility(null);
        }}
        initial={editingFacility}
        onSubmit={handleFacilitySubmit}
      />

      <ConfirmDialog
        open={removingFacility !== null}
        onClose={() => setRemovingFacility(null)}
        onConfirm={() => {
          if (removingFacility) removeFacility(removingFacility.id);
        }}
        title="Remove Facility"
        description={
          removingFacility
            ? `Remove "${removingFacility.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        variant="destructive"
      />
    </>
  );
}
