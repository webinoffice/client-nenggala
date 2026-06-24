// src/app/app/(authenticated)/master/dojang/DojangFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Dojang } from "../_shared/dojangs";

export type DojangFormValues = {
  dojangName: string;
  image: string;
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
  const [image, setImage] = useState(initial?.image ?? "");
  const [errors, setErrors] = useState<{ dojangName?: string }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!dojangName.trim()) next.dojangName = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({ dojangName: dojangName.trim(), image: image.trim() });
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
        <Input
          label="Image"
          placeholder="e.g. /images/location-kedoya.jpg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
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
