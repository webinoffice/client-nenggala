// src/app/app/(authenticated)/coach-me/schedule/ClassListModal.tsx
"use client";

import Modal from "@/components/ui/Modal";
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

// Member/coach details come straight off the schedule (get-schedule-mbr /
// get-schedule-coach), which a logged-in coach is allowed to read — the old
// coach/student lookup maps relied on get-user-data, which the backend blocks
// for coaches, so this view would render blank names for them.
export default function ClassListModal({ schedule, onClose }: Props) {
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
              name={schedule.primaryCoachName || schedule.primaryCoachUsername}
            />
            {schedule.additionalCoaches.map((c) => (
              <CoachRow
                key={c.scheduleCoachId}
                role="Secondary"
                name={c.name || c.username}
                sabuk={c.belt}
              />
            ))}
          </div>
        </div>

        {/* Students section */}
        <div>
          <h3 className="font-display text-[11px] font-bold uppercase tracking-widest text-muted mb-3">
            Students ({schedule.studentUsernames.length})
          </h3>
          <div className="border border-ink/10 rounded-sm overflow-hidden">
            {schedule.members.length === 0 ? (
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
                  {schedule.members.map((m) => (
                    <tr key={m.scheduleMbrId} className="border-t border-ink/5">
                      <td className="px-3 py-2 font-medium text-ink">
                        {m.username}
                      </td>
                      <td className="px-3 py-2 text-ink">{m.name || "-"}</td>
                      <td className="px-3 py-2 text-ink/70">{m.belt || "-"}</td>
                      <td className="px-3 py-2 text-ink/70">
                        {m.dojang || "-"}
                      </td>
                    </tr>
                  ))}
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
