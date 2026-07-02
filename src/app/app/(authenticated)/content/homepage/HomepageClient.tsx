// src/app/app/(authenticated)/content/homepage/HomepageClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/app/PageHeader";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ImageUploadField from "@/components/app/ImageUploadField";
import {
  useHomepageContent,
  updateBanner,
  saveHighlight,
} from "@/lib/cms/homepage";
import { useEvents, HIGHLIGHT_EVENT_ID } from "@/lib/events";
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

  // The homepage store hydrates asynchronously after this component mounts, so
  // `src`/`alt` start as the INITIAL_HOMEPAGE fallback and only become the real
  // backend values once the fetch resolves. Re-sync local state when they land
  // (and after a save re-hydrates), but never clobber a preview the user is
  // actively editing (a file has been picked).
  useEffect(() => {
    if (!file) {
      setPreview(src);
      setAltText(alt);
    }
  }, [src, alt, file]);

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

function EventHighlightEditor() {
  const events = useEvents();

  // Real, active events the admin can promote — excludes the synthetic
  // highlight row that the events store injects for the current feature.
  const selectable = useMemo(
    () => events.filter((e) => e.status === "Active" && e.id !== HIGHLIGHT_EVENT_ID),
    [events],
  );
  const current = useMemo(
    () => events.find((e) => e.id === HIGHLIGHT_EVENT_ID) ?? null,
    [events],
  );

  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Default the selection to the first available event once loaded.
  useEffect(() => {
    if (!selected && selectable[0]) setSelected(selectable[0].id);
  }, [selectable, selected]);

  const handleSave = async () => {
    if (!selected) {
      setError("Select an event to feature");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await saveHighlight(selected);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save highlight");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ContentSection
      title="Event Highlight"
      description="Feature one event in the homepage highlight banner. Saving copies that event's title, date, description, link, and image into the highlight."
    >
      {current && (
        <p className="mb-3 text-sm text-muted">
          Currently featured:{" "}
          <span className="font-semibold text-ink">{current.title}</span>
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="max-w-md flex-1">
          <Select
            label="Highlighted Event"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setSaved(false);
            }}
          >
            {selectable.length === 0 ? (
              <option value="">No active events</option>
            ) : (
              selectable.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))
            )}
          </Select>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving || !selected}>
          {saving ? "Saving…" : "Save Highlight"}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-brand">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
          Highlight saved
        </p>
      )}
    </ContentSection>
  );
}

export default function HomepageClient() {
  const content = useHomepageContent();

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

        <EventHighlightEditor />

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
