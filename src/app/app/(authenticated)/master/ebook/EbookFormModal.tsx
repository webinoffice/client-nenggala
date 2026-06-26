// src/app/app/(authenticated)/master/ebook/EbookFormModal.tsx
"use client";

import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useSabukOptions } from "../_shared/belts";

export type EbookFormValues = {
  sabuk: string;
  title: string;
  file: File | null;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: EbookFormValues) => void;
}

// Insert only — the backend saveEBookMs has no edit path, so the ebook form
// always creates a new record (editing is done by delete + re-add).
export default function EbookFormModal({ open, onClose, onSubmit }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Add E-Book" size="md">
      <EbookFormBody key={open ? "open" : "closed"} onCancel={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}

function EbookFormBody({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (values: EbookFormValues) => void;
}) {
  const sabukOptions = useSabukOptions();
  const [sabuk, setSabuk] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    sabuk?: string;
    title?: string;
    file?: string;
  }>({});

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!sabuk) next.sabuk = "Required";
    if (!title.trim()) next.title = "Required";
    if (!file) next.file = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({ sabuk, title: title.trim(), file });
  };

  return (
    <>
      <div className="space-y-4">
        <Select
          label="Sabuk"
          value={sabuk}
          onChange={(e) => setSabuk(e.target.value)}
          error={errors.sabuk}
        >
          <option value="">Select Sabuk</option>
          {sabukOptions
            .filter((s) => s !== "-")
            .map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
        </Select>
        <Input
          label="Title"
          placeholder="e.g. Cara Menendang"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />
        <div className="flex flex-col gap-2">
          <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
            PDF File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-ink/15 file:bg-paper-soft file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-ink hover:file:bg-paper"
          />
          {file && <p className="text-xs text-muted">Selected: {file.name}</p>}
          {errors.file && <p className="text-xs text-brand">{errors.file}</p>}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          Add E-Book
        </Button>
      </div>
    </>
  );
}
