// src/app/app/(authenticated)/coach-me/schedule/ClassListModal.tsx
"use client";

import Modal from "@/components/ui/Modal";
import {
  getProgramById,
  getSubProgramById,
  useAcademic,
} from "../../student/_shared/academic";
import type { Schedule } from "../../coach/_shared/schedules";
import type { Coach } from "../../coach/_shared/coaches";
import type { Student } from "../../student/_shared/students";

interface Props {
  schedule: Schedule | null;
  onClose: () => void;
  coachByUsername: Map<string, Coach>;
  studentByUsername: Map<string, Student>;
}

export default function ClassListModal({
  schedule,
  onClose,
  coachByUsername,
  studentByUsername,
}: Props) {
  // Subscribe so the title's program/sub-program names stay fresh (3c hydrate).
  useAcademic();
  if (!schedule) {
    return (
      <Modal open={false} onClose={onClose} title="">
        <div />
      </Modal>
    );
  }

  const program = getProgramById(schedule.programId);
  const subProgram = getSubProgramById(schedule.subProgramId);
  const primaryCoach = coachByUsername.get(schedule.primaryCoachUsername);

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`${schedule.dayOfWeek} · ${program?.name ?? schedule.programId} · ${subProgram?.name ?? schedule.subProgramId}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Coaches section */}
        <div>
          <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-muted mb-3">
            Coaches
          </h3>
          <div className="bg-paper-soft rounded-sm border border-ink/10 p-3 space-y-2">
            <CoachRow
              role="Primary"
              name={primaryCoach?.namaLengkap ?? schedule.primaryCoachUsername}
              sabuk={primaryCoach?.sabuk}
            />
            {schedule.secondaryCoachUsernames.map((u) => {
              const c = coachByUsername.get(u);
              return (
                <CoachRow
                  key={u}
                  role="Secondary"
                  name={c?.namaLengkap ?? u}
                  sabuk={c?.sabuk}
                />
              );
            })}
            {schedule.assistantUsernames.map((u) => {
              const c = coachByUsername.get(u);
              const s = studentByUsername.get(u);
              return (
                <CoachRow
                  key={u}
                  role={c ? "Assistant (Coach)" : "Assistant (Student)"}
                  name={c?.namaLengkap ?? s?.namaLengkap ?? u}
                  sabuk={c?.sabuk ?? s?.sabuk}
                />
              );
            })}
          </div>
        </div>

        {/* Students section */}
        <div>
          <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-muted mb-3">
            Students ({schedule.studentUsernames.length})
          </h3>
          <div className="border border-ink/10 rounded-sm overflow-hidden">
            {schedule.studentUsernames.length === 0 ? (
              <div className="text-center py-8 text-muted uppercase tracking-widest text-xs font-bold">
                No students enrolled
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <tr>
                    <th className="text-left px-3 py-2">No</th>
                    <th className="text-left px-3 py-2">Nama</th>
                    <th className="text-left px-3 py-2">Sabuk</th>
                    <th className="text-left px-3 py-2">Dojang</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.studentUsernames.map((u) => {
                    const s = studentByUsername.get(u);
                    return (
                      <tr key={u} className="border-t border-ink/5">
                        <td className="px-3 py-2 font-medium text-ink">{u}</td>
                        <td className="px-3 py-2 text-ink">
                          {s?.namaLengkap ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-ink/70">
                          {s?.sabuk ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-ink/70">
                          {s?.dojang ?? "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CoachRow({
  role,
  name,
  sabuk,
}: {
  role: string;
  name: string;
  sabuk?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-brand mr-2">
          {role}
        </span>
        <span className="text-ink">{name}</span>
      </div>
      {sabuk && <span className="text-xs text-muted">{sabuk}</span>}
    </div>
  );
}
