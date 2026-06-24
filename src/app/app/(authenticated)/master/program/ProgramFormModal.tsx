// src/app/app/(authenticated)/master/program/ProgramFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Program } from "../_shared/programs";

export type ProgramFormValues = {
  programName: string;
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
  const [errors, setErrors] = useState<{ programName?: string }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!programName.trim()) next.programName = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({ programName: programName.trim() });
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
