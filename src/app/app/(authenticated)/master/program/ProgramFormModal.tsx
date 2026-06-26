// src/app/app/(authenticated)/master/program/ProgramFormModal.tsx
"use client";

import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Program } from "../_shared/programs";

export type ProgramFormValues = {
  programName: string;
  imageFile: File | null;
};

interface ProgramFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: Program | null;
  onSubmit: (values: ProgramFormValues) => void;
}

export default function ProgramFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: ProgramFormModalProps) {
  const isEditing = initial !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update Program" : "Add Program"}
      size="md"
    >
      <ProgramFormBody
        key={initial?.id ?? "new"}
        initial={initial}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function ProgramFormBody({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: Program | null;
  onCancel: () => void;
  onSubmit: (values: ProgramFormValues) => void;
}) {
  const [programName, setProgramName] = useState(initial?.programName ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ programName?: string }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!programName.trim()) next.programName = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({ programName: programName.trim(), imageFile });
  };

  return (
    <>
      <div className="space-y-4">
        <Input
          label="Program Name"
          placeholder="e.g. Taekwondo"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          error={errors.programName}
        />
        <div className="flex flex-col gap-2">
          <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
            Image
          </label>
          {isEditing && initial?.image && !imageFile && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initial.image}
              alt={initial.programName}
              className="h-20 w-20 rounded-sm border border-ink/10 object-cover"
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
          {isEditing ? "Save Changes" : "Add Program"}
        </Button>
      </div>
    </>
  );
}
