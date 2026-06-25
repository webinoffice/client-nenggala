// src/app/app/(authenticated)/content/events/EventFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploadField from "@/components/app/ImageUploadField";
import type { EventItem } from "@/lib/events";

export type EventFormValues = {
  title: string;
  date: string;
  description: string;
  image: string;
  registerUrl: string;
  /** Picked image file — uploaded inline on save (required by the backend). */
  file: File | null;
};

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: EventItem | null;
  onSubmit: (values: EventFormValues) => void;
  submitting?: boolean;
  error?: string | null;
}

export default function EventFormModal({
  open,
  onClose,
  initial,
  onSubmit,
  submitting,
  error,
}: EventFormModalProps) {
  const isEditing = initial !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update Event" : "Add Event"}
      size="lg"
    >
      <EventFormBody
        key={initial?.id ?? "new"}
        initial={initial}
        onCancel={onClose}
        onSubmit={onSubmit}
        submitting={submitting}
        submitError={error}
      />
    </Modal>
  );
}

function EventFormBody({
  initial,
  onCancel,
  onSubmit,
  submitting,
  submitError,
}: {
  initial: EventItem | null;
  onCancel: () => void;
  onSubmit: (values: EventFormValues) => void;
  submitting?: boolean;
  submitError?: string | null;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [registerUrl, setRegisterUrl] = useState(initial?.registerUrl ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    date?: string;
    registerUrl?: string;
    image?: string;
  }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "Required";
    if (!date.trim()) next.date = "Required";
    if (!registerUrl.trim()) next.registerUrl = "Required";
    // The backend re-uploads the image on every save (it deletes the old file),
    // so a file is required even when editing.
    if (!file) next.image = "Select an image (required on every save)";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({
      title: title.trim(),
      date,
      description: description.trim(),
      image,
      registerUrl: registerUrl.trim(),
      file,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g. Ujian Kenaikan Tingkat 2026"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
          <Input
            label="Register URL"
            placeholder="e.g. bit.ly/nenggala-ukt-2026"
            value={registerUrl}
            onChange={(e) => setRegisterUrl(e.target.value)}
            error={errors.registerUrl}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Short event description"
            className="rounded-sm border border-ink/15 bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors"
          />
        </div>
        <ImageUploadField
          label="Image"
          value={image}
          onChange={setImage}
          onFileChange={setFile}
          error={errors.image}
          aspectClassName="aspect-[4/3]"
        />
      </div>
      {submitError && (
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-brand">
          {submitError}
        </p>
      )}
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Saving…" : isEditing ? "Save Changes" : "Add Event"}
        </Button>
      </div>
    </>
  );
}
