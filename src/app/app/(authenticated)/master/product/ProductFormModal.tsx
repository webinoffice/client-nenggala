// src/app/app/(authenticated)/master/product/ProductFormModal.tsx
"use client";

import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import type { Product } from "../_shared/products";
import { useProductTypes } from "../_shared/product-types";

export type ProductFormValues = {
  typeId: number;
  productName: string;
  link: string;
  imageFile: File | null;
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
        key={initial?.id ?? "new"}
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
  const productTypes = useProductTypes();
  const [typeId, setTypeId] = useState<number | "">(initial?.typeId ?? "");
  const [productName, setProductName] = useState(initial?.productName ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    typeId?: string;
    productName?: string;
    link?: string;
  }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (typeId === "") next.typeId = "Required";
    if (!productName.trim()) next.productName = "Required";
    if (!link.trim()) next.link = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({
      typeId: Number(typeId),
      productName: productName.trim(),
      link: link.trim(),
      imageFile,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <Select
          label="Type"
          value={typeId === "" ? "" : String(typeId)}
          onChange={(e) =>
            setTypeId(e.target.value === "" ? "" : Number(e.target.value))
          }
          error={errors.typeId}
        >
          <option value="">Select a type</option>
          {productTypes.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </Select>
        <Input
          label="Product Name"
          placeholder="e.g. Uniform"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          error={errors.productName}
        />
        <Input
          label="Link"
          placeholder="https://..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
          error={errors.link}
        />
        <div className="flex flex-col gap-2">
          <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
            Image
          </label>
          {isEditing && initial?.image && !imageFile && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initial.image}
              alt={initial.productName}
              className="h-24 w-24 rounded-sm border border-ink/10 object-cover"
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
          {isEditing ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </>
  );
}
