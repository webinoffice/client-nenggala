// src/app/app/(authenticated)/content/homepage/HomepageClient.tsx
"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/app/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ImageUploadField from "@/components/app/ImageUploadField";
import {
  useHomepageContent,
  updateHomepageContent,
  updateBanner,
} from "@/lib/cms/homepage";
import { useEvents } from "@/lib/events";
import ContentSection from "../_shared/ContentSection";
import GalleryManager from "../_shared/GalleryManager";

function BannerEditor({
  which,
  label,
  src,
  alt,
  aspectClassName,
}: {
  which: "top" | "bottom";
  label: string;
  src: string;
  alt: string;
  aspectClassName: string;
}) {
  const [preview, setPreview] = useState(src);
  const [altText, setAltText] = useState(alt);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!file) {
      setError("Select an image (required on every save)");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateBanner(which, altText, file);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save banner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <ImageUploadField
        label={label}
        value={preview}
        onChange={setPreview}
        onFileChange={setFile}
        aspectClassName={aspectClassName}
      />
      <Input
        label={`${label} Alt Text`}
        value={altText}
        onChange={(e) => setAltText(e.target.value)}
        placeholder="Describe the banner"
      />
      {error && (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Banner"}
        </Button>
      </div>
    </div>
  );
}

export default function HomepageClient() {
  const content = useHomepageContent();
  const events = useEvents();

  const activeEvents = useMemo(
    () => events.filter((e) => e.status === "Active"),
    [events],
  );

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Edit the homepage banners, gallery, and highlighted event."
      />

      <div className="space-y-6">
        <ContentSection
          title="Banners"
          description="Top banner appears at the very top of the homepage; the bottom banner sits above the event highlight. A new image is required each time you save."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <BannerEditor
              which="top"
              label="Top Banner"
              src={content.topBanner.src}
              alt={content.topBanner.alt}
              aspectClassName="aspect-[1920/900]"
            />
            <BannerEditor
              which="bottom"
              label="Bottom Banner"
              src={content.bottomBanner.src}
              alt={content.bottomBanner.alt}
              aspectClassName="aspect-[1920/600]"
            />
          </div>
        </ContentSection>

        <ContentSection
          title="Event Highlight"
          description="The event featured in the homepage highlight banner. NOTE: selection is not yet persisted — the backend manages the highlight as its own content row (see TODO in homepage store)."
        >
          <div className="max-w-md">
            <Select
              label="Highlighted Event"
              value={content.highlightEventId}
              onChange={(e) =>
                updateHomepageContent({ highlightEventId: e.target.value })
              }
            >
              {activeEvents.length === 0 ? (
                <option value="">No active events</option>
              ) : (
                activeEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))
              )}
            </Select>
          </div>
        </ContentSection>

        <ContentSection
          title="Gallery"
          description="The carousel shown on the homepage (and reused on the about page)."
        >
          <GalleryManager />
        </ContentSection>
      </div>
    </>
  );
}
