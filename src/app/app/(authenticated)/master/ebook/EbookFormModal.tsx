// src/app/app/(authenticated)/master/ebook/EbookFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import type { Ebook } from "../_shared/ebooks";
import { useSabukOptions } from "../_shared/belts";

export type EbookFormValues = {
  sabuk: string;
  title: string;
  pdfFile: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  initial: Ebook | null;
  onSubmit: (values: EbookFormValues) => void;
}

export default function EbookFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const isEditing = initial !== null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update E-Book" : "Add E-Book"}
      size="md"
    >
      <EbookFormBody
        key={initial?.id ?? "new"}
        initial={initial}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function EbookFormBody({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: Ebook | null;
  onCancel: () => void;
  onSubmit: (values: EbookFormValues) => void;
}) {
  const sabukOptions = useSabukOptions();
  const [sabuk, setSabuk] = useState(initial?.sabuk ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [pdfFile, setPdfFile] = useState(initial?.pdfFile ?? "");
  const [errors, setErrors] = useState<Partial<EbookFormValues>>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: Partial<EbookFormValues> = {};
    if (!sabuk) next.sabuk = "Required";
    if (!title.trim()) next.title = "Required";
    if (!pdfFile.trim()) next.pdfFile = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({
      sabuk,
      title: title.trim(),
      pdfFile: pdfFile.trim(),
    });
  };

  return (
    <>
      <div className="space-y-4">
        {isEditing && (
          <Input label="ID" value={String(initial!.id)} disabled readOnly />
        )}
        <Select
          label="Sabuk"
          value={sabuk}
          onChange={(e) => setSabuk(e.target.value)}
          error={errors.sabuk}
        >
          <option value="">Select Sabuk</option>
          {sabukOptions.filter((s) => s !== "-").map((s) => (
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
        <Input
          label="PDF File"
          placeholder="e.g. putih-cara-menendang.pdf"
          value={pdfFile}
          onChange={(e) => setPdfFile(e.target.value)}
          error={errors.pdfFile}
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {isEditing ? "Save Changes" : "Add E-Book"}
        </Button>
      </div>
    </>
  );
}
