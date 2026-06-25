// src/app/app/(authenticated)/me/schedule/ExamRegistrationModal.tsx
"use client";

import { useRef, useState } from "react";
import { Upload, FileCheck2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  getProgramById,
  getSubProgramById,
  useAcademic,
} from "../../student/_shared/academic";
import type { Schedule } from "../../coach/_shared/schedules";

interface Props {
  schedule: Schedule | null;
  onClose: () => void;
}

export default function ExamRegistrationModal({ schedule, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  // Subscribe so program/sub-program names re-render on master change/hydrate.
  useAcademic();

  const program = schedule ? getProgramById(schedule.programId) : null;
  const subProgram = schedule ? getSubProgramById(schedule.subProgramId) : null;

  const reset = () => {
    setFile(null);
    setSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!file) return;
    // Mock: in production this would upload to a server, create a registration record,
    // and notify admin for verification.
    setSubmitted(true);
  };

  return (
    <Modal
      open={schedule !== null}
      onClose={handleClose}
      title={submitted ? "Registration Submitted" : "Register for Exam"}
      size="md"
      footer={
        submitted ? (
          <Button variant="primary" size="sm" onClick={handleClose}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!file}
            >
              Submit Registration
            </Button>
          </>
        )
      }
    >
      {!schedule ? null : submitted ? (
        <div className="text-center py-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <FileCheck2 size={24} className="text-emerald-600" />
          </div>
          <p className="text-sm text-ink font-medium">
            Your exam registration has been submitted.
          </p>
          <p className="text-xs text-muted mt-1">
            Admin will verify your payment proof shortly. You will be notified
            once approved.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-paper-soft rounded-sm border border-ink/10 p-4 space-y-2">
            <InfoRow
              label="Class"
              value={`${program?.name ?? schedule.programId} · ${subProgram?.name ?? schedule.subProgramId}`}
            />
            <InfoRow label="Day" value={schedule.dayOfWeek} />
            <InfoRow
              label="Time"
              value={`${schedule.startTime} – ${schedule.endTime}`}
            />
            <InfoRow label="Period" value={schedule.periodId} />
          </div>

          <div className="bg-accent/10 border border-accent/30 rounded-sm p-3 text-xs text-ink/80 leading-relaxed">
            <p className="font-bold uppercase tracking-widest text-[10px] text-ink mb-1">
              Payment Info
            </p>
            Transfer the exam fee to{" "}
            <span className="font-bold">BCA 1234567890</span> a.n. Nenggala
            Academy, then upload your payment proof (bukti bayar) below.
          </div>

          <div>
            <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink mb-2 block">
              Upload Bukti Bayar
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-ink/20 rounded-sm py-6 px-4 flex flex-col items-center justify-center gap-2 hover:border-ink/40 hover:bg-paper-soft transition-colors"
            >
              <Upload size={20} className="text-muted" />
              <span className="text-sm text-ink font-medium">
                {file ? file.name : "Click to upload image or PDF"}
              </span>
              {file && (
                <span className="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">
                  Ready to submit
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
      <span className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  );
}
