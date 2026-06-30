// src/app/app/(authenticated)/joint-training/JointTrainingFormModal.tsx
"use client";

import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { fileUrl } from "@/lib/api/file-url";
import type { ScheduleMergeHdRow } from "@/lib/api/schedule-merge";

export interface JointTrainingFormValues {
  title: string;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  description: string;
  featured: boolean;
  image: File | null;
}

interface Props {
  open: boolean;
  initial: ScheduleMergeHdRow | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: JointTrainingFormValues) => void;
}

export default function JointTrainingFormModal({
  open,
  initial,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const isEditing = initial !== null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Latihan Gabungan" : "Tambah Latihan Gabungan"}
      size="md"
    >
      <FormBody
        key={initial?.ScheduleMergeHdId ?? "new"}
        initial={initial}
        saving={saving}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function FormBody({
  initial,
  saving,
  onCancel,
  onSubmit,
}: {
  initial: ScheduleMergeHdRow | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: JointTrainingFormValues) => void;
}) {
  const [title, setTitle] = useState(initial?.ScheduleTitle ?? "");
  const [date, setDate] = useState(initial?.ScheduleDateIso ?? "");
  const [timeStart, setTimeStart] = useState(initial?.TimeStart ?? "");
  const [timeEnd, setTimeEnd] = useState(initial?.TimeEnd ?? "");
  const [description, setDescription] = useState(initial?.ScheduleDesc ?? "");
  const [featured, setFeatured] = useState(initial?.FgFeatured === "Y");
  const [image, setImage] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    title?: string;
    date?: string;
    timeStart?: string;
    timeEnd?: string;
  }>({});

  const existingImage = initial?.ScheduleImage
    ? fileUrl(initial.ScheduleImage)
    : "";

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!title.trim()) next.title = "Required";
    if (!date) next.date = "Required";
    if (!timeStart) next.timeStart = "Required";
    if (!timeEnd) next.timeEnd = "Required";
    if (timeStart && timeEnd && timeEnd < timeStart) {
      next.timeEnd = "End must be after start";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSubmit({
      title: title.trim(),
      date,
      timeStart,
      timeEnd,
      description: description.trim(),
      featured,
      image,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <Input
          label="Judul"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          placeholder="e.g. Latihan Gabungan Akbar 2026"
        />
        <Input
          label="Tanggal"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Jam Mulai"
            type="time"
            value={timeStart}
            onChange={(e) => setTimeStart(e.target.value)}
            error={errors.timeStart}
          />
          <Input
            label="Jam Selesai"
            type="time"
            value={timeEnd}
            onChange={(e) => setTimeEnd(e.target.value)}
            error={errors.timeEnd}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
            Deskripsi
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Deskripsi acara…"
            className="rounded-sm border border-ink/15 bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
            Gambar
          </label>
          {existingImage && !image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={existingImage}
              alt="Current"
              className="h-24 w-auto rounded-sm border border-ink/10 object-cover"
            />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-ink/15 file:bg-paper-soft file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-ink hover:file:bg-paper"
          />
          {image && <p className="text-xs text-muted">Selected: {image.name}</p>}
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="accent-brand"
          />
          <span className="text-sm text-ink">
            Jadikan sorotan dashboard{" "}
            <span className="text-muted">
              (hanya satu yang dapat disorot — ini akan menggantikan yang lama)
            </span>
          </span>
        </label>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          Batal
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Menyimpan…" : initial ? "Simpan" : "Tambah"}
        </Button>
      </div>
    </>
  );
}
