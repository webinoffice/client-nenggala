// src/app/app/(authenticated)/content/about/FacilityFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploadField from "@/components/app/ImageUploadField";
import type { Facility } from "@/lib/cms/about";

export type FacilityFormValues = {
  name: string;
  detail: string;
  image: string;
};

interface FacilityFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: Facility | null;
  onSubmit: (values: FacilityFormValues) => void;
}

export default function FacilityFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: FacilityFormModalProps) {
  const isEditing = initial !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update Facility" : "Add Facility"}
      size="md"
    >
      <FacilityFormBody
        key={initial?.id ?? "new"}
        initial={initial}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function FacilityFormBody({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: Facility | null;
  onCancel: () => void;
  onSubmit: (values: FacilityFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [detail, setDetail] = useState(initial?.detail ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [errors, setErrors] = useState<{ name?: string }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrors({ name: "Required" });
      return;
    }
    onSubmit({ name: name.trim(), detail: detail.trim(), image });
  };

  return (
    <>
      <div className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g. Main Dojang"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Detail"
          placeholder="e.g. Indoor sparring hall · 320 m²"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <ImageUploadField
          label="Image"
          value={image}
          onChange={setImage}
          aspectClassName="aspect-[16/10]"
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {isEditing ? "Save Changes" : "Add Facility"}
        </Button>
      </div>
    </>
  );
}
