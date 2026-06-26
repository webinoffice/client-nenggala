// src/app/app/(authenticated)/master/dojang/DojangFormModal.tsx
"use client";

import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Dojang } from "../_shared/dojangs";

export type DojangFormValues = {
  dojangName: string;
  imageFile: File | null;
};

interface DojangFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: Dojang | null;
  onSubmit: (values: DojangFormValues) => void;
}

export default function DojangFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: DojangFormModalProps) {
  const isEditing = initial !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update Dojang" : "Add Dojang"}
      size="md"
    >
      <DojangFormBody
        key={initial?.id ?? "new"}
        initial={initial}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function DojangFormBody({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: Dojang | null;
  onCancel: () => void;
  onSubmit: (values: DojangFormValues) => void;
}) {
  const [dojangName, setDojangName] = useState(initial?.dojangName ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ dojangName?: string }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!dojangName.trim()) next.dojangName = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({ dojangName: dojangName.trim(), imageFile });
  };

  return (
    <>
      <div className="space-y-4">
        <Input
          label="Dojang Name"
          placeholder="e.g. Kedoya Sport Club"
          value={dojangName}
          onChange={(e) => setDojangName(e.target.value)}
          error={errors.dojangName}
        />
        <div className="flex flex-col gap-2">
          <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
            Image
          </label>
          {isEditing && initial?.image && !imageFile && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initial.image}
              alt={initial.dojangName}
              className="h-20 w-32 rounded-sm border border-ink/10 object-cover"
            />
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-ink/15 file:bg-paper-soft file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-ink hover:file:bg-paper"
          />
          {imageFile && (
            <p className="text-xs text-muted">Selected: {imageFile.name}</p>
          )}
          {isEditing && (
            <p className="text-xs text-muted">
              Leave empty to keep the current image.
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {isEditing ? "Save Changes" : "Add Dojang"}
        </Button>
      </div>
    </>
  );
}
