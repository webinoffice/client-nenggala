// src/app/app/(authenticated)/master/sub-program/SubProgramFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { INITIAL_PROGRAMS } from "../_shared/programs";
import type { SubProgram } from "./MasterSubProgramClient";

export type SubProgramFormValues = {
  programId: string;
  subProgramId: string;
  subProgramName: string;
  image: string;
};

interface SubProgramFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: SubProgram | null;
  existingSubIds: string[];
  onSubmit: (values: SubProgramFormValues) => void;
}

export default function SubProgramFormModal({
  open,
  onClose,
  initial,
  existingSubIds,
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
        existingSubIds={existingSubIds}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function SubProgramFormBody({
  initial,
  existingSubIds,
  onCancel,
  onSubmit,
}: {
  initial: SubProgram | null;
  existingSubIds: string[];
  onCancel: () => void;
  onSubmit: (values: SubProgramFormValues) => void;
}) {
  const [programId, setProgramId] = useState(initial?.programId ?? "");
  const [subProgramId, setSubProgramId] = useState(initial?.subProgramId ?? "");
  const [subProgramName, setSubProgramName] = useState(
    initial?.subProgramName ?? "",
  );
  const [image, setImage] = useState(initial?.image ?? "");
  const [errors, setErrors] = useState<{
    programId?: string;
    subProgramId?: string;
    subProgramName?: string;
  }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!programId) next.programId = "Required";
    const trimmedSubId = subProgramId.trim().toUpperCase();
    if (!trimmedSubId) next.subProgramId = "Required";
    else if (!isEditing && existingSubIds.includes(trimmedSubId))
      next.subProgramId = "Sub-Program ID already exists";
    if (!subProgramName.trim()) next.subProgramName = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({
      programId,
      subProgramId: trimmedSubId,
      subProgramName: subProgramName.trim(),
      image: image.trim(),
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
          {INITIAL_PROGRAMS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} — {p.programName}
            </option>
          ))}
        </Select>
        <Input
          label="Sub-Program ID"
          placeholder="e.g. TKD-01"
          value={subProgramId}
          onChange={(e) => setSubProgramId(e.target.value.toUpperCase())}
          error={errors.subProgramId}
          disabled={isEditing}
        />
        <Input
          label="Sub-Program Name"
          placeholder="e.g. Kyorugi"
          value={subProgramName}
          onChange={(e) => setSubProgramName(e.target.value)}
          error={errors.subProgramName}
        />
        <Input
          label="Image"
          placeholder="filename.jpg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
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
