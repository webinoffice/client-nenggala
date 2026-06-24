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
  dojangs: string[]; // one record is created per dojang (add mode)
};

interface SchedulePeriodFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: SchedulePeriod | null;
  isSuper: boolean;
  adminDojang: string;
  dojangOptions: string[];
  onSubmit: (values: SchedulePeriodFormValues) => void;
}

export default function SchedulePeriodFormModal({
  open,
  onClose,
  initial,
  isSuper,
  adminDojang,
  dojangOptions,
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
        isSuper={isSuper}
        adminDojang={adminDojang}
        dojangOptions={dojangOptions}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function SchedulePeriodFormBody({
  initial,
  isSuper,
  adminDojang,
  dojangOptions,
  onCancel,
  onSubmit,
}: {
  initial: SchedulePeriod | null;
  isSuper: boolean;
  adminDojang: string;
  dojangOptions: string[];
  onCancel: () => void;
  onSubmit: (values: SchedulePeriodFormValues) => void;
}) {
  const isEditing = initial !== null;

  const [periodName, setPeriodName] = useState(initial?.periodName ?? "");
  const [periodStart, setPeriodStart] = useState(initial?.periodStart ?? "");
  const [periodEnd, setPeriodEnd] = useState(initial?.periodEnd ?? "");
  // Super-admin add: pick one or more dojangs (bulk create one per dojang).
  const [selectedDojangs, setSelectedDojangs] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    periodName?: string;
    periodStart?: string;
    periodEnd?: string;
    dojangs?: string;
  }>({});

  const toggleDojang = (d: string) =>
    setSelectedDojangs((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  const allSelected = selectedDojangs.length === dojangOptions.length;
  const toggleAll = () =>
    setSelectedDojangs(allSelected ? [] : [...dojangOptions]);

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!periodName.trim()) next.periodName = "Required";
    if (!periodStart) next.periodStart = "Required";
    if (!periodEnd) next.periodEnd = "Required";
    if (periodStart && periodEnd && periodEnd < periodStart) {
      next.periodEnd = "End must be on or after start";
    }

    // Determine target dojangs.
    let dojangs: string[];
    if (isEditing) {
      dojangs = [initial!.dojang];
    } else if (isSuper) {
      dojangs = selectedDojangs;
      if (dojangs.length === 0) next.dojangs = "Select at least one dojang";
    } else {
      dojangs = [adminDojang];
    }

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({
      periodName: periodName.trim(),
      periodStart,
      periodEnd,
      dojangs,
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
          disabled={isEditing}
        />
        <Input
          label="Period End"
          type="month"
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          error={errors.periodEnd}
        />

        {/* Dojang assignment */}
        {isEditing ? (
          <Input label="Dojang" value={initial!.dojang} disabled />
        ) : isSuper ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
                Dojang (bulk create)
              </label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[11px] font-bold uppercase tracking-widest text-brand hover:text-brand-hover"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            </div>
            <div className="space-y-1.5 rounded-sm border border-ink/10 p-3">
              {dojangOptions.map((d) => (
                <label
                  key={d}
                  className="flex items-center gap-2 text-sm text-ink cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedDojangs.includes(d)}
                    onChange={() => toggleDojang(d)}
                    className="accent-brand"
                  />
                  {d}
                </label>
              ))}
            </div>
            {errors.dojangs && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                {errors.dojangs}
              </span>
            )}
            <p className="text-xs text-muted mt-2">
              One period is created for each selected dojang.
            </p>
          </div>
        ) : (
          <Input label="Dojang" value={adminDojang} disabled />
        )}
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
