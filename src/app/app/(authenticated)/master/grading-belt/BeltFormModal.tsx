// src/app/app/(authenticated)/master/grading-belt/BeltFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Belt } from "./MasterBeltClient";

export type BeltFormValues = {
  beltName: string;
  beltLevel: number;
};

interface BeltFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: Belt | null;
  onSubmit: (values: BeltFormValues) => void;
}

export default function BeltFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: BeltFormModalProps) {
  const isEditing = initial !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update Belt" : "Add Belt"}
      size="md"
    >
      <BeltFormBody
        key={initial?.id ?? "new"}
        initial={initial}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function BeltFormBody({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: Belt | null;
  onCancel: () => void;
  onSubmit: (values: BeltFormValues) => void;
}) {
  const [beltName, setBeltName] = useState(initial?.beltName ?? "");
  const [beltLevel, setBeltLevel] = useState<string>(
    initial ? String(initial.beltLevel) : "",
  );
  const [errors, setErrors] = useState<{
    beltName?: string;
    beltLevel?: string;
  }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!beltName.trim()) next.beltName = "Required";
    if (beltLevel.trim() === "") {
      next.beltLevel = "Required";
    } else if (!/^-?\d+$/.test(beltLevel.trim())) {
      next.beltLevel = "Must be a whole number";
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({
      beltName: beltName.trim(),
      beltLevel: parseInt(beltLevel, 10),
    });
  };

  return (
    <>
      <div className="space-y-4">
        {isEditing && (
          <Input label="ID" value={String(initial!.id)} disabled readOnly />
        )}
        <Input
          label="Belt Name"
          placeholder="e.g. Putih"
          value={beltName}
          onChange={(e) => setBeltName(e.target.value)}
          error={errors.beltName}
        />
        <Input
          label="Belt Level"
          placeholder="e.g. 0"
          value={beltLevel}
          onChange={(e) => setBeltLevel(e.target.value)}
          error={errors.beltLevel}
          inputMode="numeric"
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {isEditing ? "Save Changes" : "Add Belt"}
        </Button>
      </div>
    </>
  );
}
