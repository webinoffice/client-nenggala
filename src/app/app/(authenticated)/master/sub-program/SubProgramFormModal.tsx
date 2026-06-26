// src/app/app/(authenticated)/master/sub-program/SubProgramFormModal.tsx
"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { getPrograms, subscribePrograms } from "../_shared/programs";
import type { SubProgram } from "../_shared/sub-programs";

export type SubProgramFormValues = {
  programId: number;
  subProgramName: string;
  imageFile: File | null;
};

interface SubProgramFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: SubProgram | null;
  onSubmit: (values: SubProgramFormValues) => void;
}

export default function SubProgramFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: SubProgramFormModalProps) {
  const isEditing = initial !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update Sub Program" : "Add Sub Program"}
      size="md"
    >
      <SubProgramFormBody
        key={initial?.subProgramId ?? "new"}
        initial={initial}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function SubProgramFormBody({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: SubProgram | null;
  onCancel: () => void;
  onSubmit: (values: SubProgramFormValues) => void;
}) {
  const programs = useSyncExternalStore(
    subscribePrograms,
    getPrograms,
    getPrograms,
  );
  const [programId, setProgramId] = useState(
    initial ? String(initial.programId) : "",
  );
  const [subProgramName, setSubProgramName] = useState(
    initial?.subProgramName ?? "",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    programId?: string;
    subProgramName?: string;
  }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!programId) next.programId = "Required";
    if (!subProgramName.trim()) next.subProgramName = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({
      programId: Number(programId),
      subProgramName: subProgramName.trim(),
      imageFile,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <Select
          label="Program"
          value={programId}
          onChange={(e) => setProgramId(e.target.value)}
          error={errors.programId}
        >
          <option value="">Select a program</option>
          {programs.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.programName}
            </option>
          ))}
        </Select>
        <Input
          label="Sub-Program Name"
          placeholder="e.g. Kyorugi"
          value={subProgramName}
          onChange={(e) => setSubProgramName(e.target.value)}
          error={errors.subProgramName}
        />
        <div className="flex flex-col gap-2">
          <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
            Image
          </label>
          {isEditing && initial?.image && !imageFile && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initial.image}
              alt={initial.subProgramName}
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
          {isEditing ? "Save Changes" : "Add Sub Program"}
        </Button>
      </div>
    </>
  );
}
