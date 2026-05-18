// src/app/app/(authenticated)/master/schedule-period/SchedulePeriodFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { SchedulePeriod } from "./MasterSchedulePeriodClient";

export type SchedulePeriodFormValues = {
  periodName: string;
  periodStart: string; // YYYY-MM
  periodEnd: string; // YYYY-MM
};

interface SchedulePeriodFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: SchedulePeriod | null;
  onSubmit: (values: SchedulePeriodFormValues) => void;
}

export default function SchedulePeriodFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: SchedulePeriodFormModalProps) {
  const isEditing = initial !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update Period" : "Add Period"}
      size="md"
    >
      <SchedulePeriodFormBody
        key={initial?.id ?? "new"}
        initial={initial}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function SchedulePeriodFormBody({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: SchedulePeriod | null;
  onCancel: () => void;
  onSubmit: (values: SchedulePeriodFormValues) => void;
}) {
  const [periodName, setPeriodName] = useState(initial?.periodName ?? "");
  const [periodStart, setPeriodStart] = useState(initial?.periodStart ?? "");
  const [periodEnd, setPeriodEnd] = useState(initial?.periodEnd ?? "");
  const [errors, setErrors] = useState<{
    periodName?: string;
    periodStart?: string;
    periodEnd?: string;
  }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!periodName.trim()) next.periodName = "Required";
    if (!periodStart) next.periodStart = "Required";
    if (!periodEnd) next.periodEnd = "Required";
    if (periodStart && periodEnd && periodEnd < periodStart) {
      next.periodEnd = "End must be on or after start";
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({
      periodName: periodName.trim(),
      periodStart,
      periodEnd,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <Input
          label="Period Name"
          placeholder="e.g. Period 34"
          value={periodName}
          onChange={(e) => setPeriodName(e.target.value)}
          error={errors.periodName}
        />
        <Input
          label="Period Start"
          type="month"
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          error={errors.periodStart}
        />
        <Input
          label="Period End"
          type="month"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          error={errors.periodEnd}
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {isEditing ? "Save Changes" : "Add Period"}
        </Button>
      </div>
    </>
  );
}
