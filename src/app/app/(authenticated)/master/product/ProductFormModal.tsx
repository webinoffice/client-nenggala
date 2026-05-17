// src/app/app/(authenticated)/master/product/ProductFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Product } from "./MasterProductClient";

export type ProductFormValues = {
  id: string;
  typeId: string;
  productName: string;
  link: string;
  image: string;
};

const EMPTY: ProductFormValues = {
  id: "",
  typeId: "",
  productName: "",
  link: "",
  image: "",
};

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: Product | null;
  onSubmit: (values: ProductFormValues) => void;
}

export default function ProductFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: ProductFormModalProps) {
  const isEditing = initial !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update Product" : "Add Product"}
      size="md"
    >
      {/* `key` forces a fresh mount (fresh state) when the editing target changes. */}
      <ProductFormBody
        key={initial?.typeId ?? "new"}
        initial={initial}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function ProductFormBody({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: Product | null;
  onCancel: () => void;
  onSubmit: (values: ProductFormValues) => void;
}) {
  const [values, setValues] = useState<ProductFormValues>(() =>
    initial
      ? {
          id: initial.id,
          typeId: initial.typeId,
          productName: initial.productName,
          link: initial.link,
          image: initial.image,
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductFormValues, string>>
  >({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!values.id.trim()) next.id = "Required";
    if (!values.typeId.trim()) next.typeId = "Required";
    if (!values.productName.trim()) next.productName = "Required";
    if (!values.link.trim()) next.link = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit(values);
  };

  return (
    <>
      <div className="space-y-4">
        <Input
          label="ID"
          placeholder="e.g. TS"
          value={values.id}
          onChange={(e) =>
            setValues((v) => ({ ...v, id: e.target.value.toUpperCase() }))
          }
          error={errors.id}
        />
        <Input
          label="Type ID"
          placeholder="e.g. TS-01"
          value={values.typeId}
          onChange={(e) =>
            setValues((v) => ({
              ...v,
              typeId: e.target.value.toUpperCase(),
            }))
          }
          error={errors.typeId}
        />
        <Input
          label="Product Name"
          placeholder="e.g. Uniform"
          value={values.productName}
          onChange={(e) =>
            setValues((v) => ({ ...v, productName: e.target.value }))
          }
          error={errors.productName}
        />
        <Input
          label="Link"
          placeholder="https://..."
          value={values.link}
          onChange={(e) => setValues((v) => ({ ...v, link: e.target.value }))}
          error={errors.link}
        />
        <Input
          label="Image"
          placeholder="filename.jpg"
          value={values.image}
          onChange={(e) => setValues((v) => ({ ...v, image: e.target.value }))}
          error={errors.image}
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {isEditing ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </>
  );
}
