// src/app/app/(authenticated)/master/sub-program/SubProgramFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { INITIAL_PROGRAMS } from "../_shared/programs";
import type { SubProgram } from "../_shared/sub-programs";

export type SubProgramFormValues = {
  programId: string;
  subProgramName: string;
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
  const [programId, setProgramId] = useState(initial?.programId ?? "");
  const [subProgramName, setSubProgramName] = useState(
    initial?.subProgramName ?? "",
  );
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
      programId,
      subProgramName: subProgramName.trim(),
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
          label="Sub-Program Name"
          placeholder="e.g. Kyorugi"
          value={subProgramName}
          onChange={(e) => setSubProgramName(e.target.value)}
          error={errors.subProgramName}
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
