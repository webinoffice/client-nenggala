// src/app/app/(authenticated)/student/_shared/StudentDrillDown.tsx
"use client";

import { useMemo } from "react";
import Select from "@/components/ui/Select";
import {
  formatPeriod,
  getDojangsForPeriod,
  getProgramsForSelection,
  getSubProgramsForSelection,
  PERIODS,
} from "./academic";

export type DrillDownSelection = {
  periodId: string;
  dojang: string;
  programId: string;
  subProgramId: string;
};

export const EMPTY_SELECTION: DrillDownSelection = {
  periodId: "",
  dojang: "",
  programId: "",
  subProgramId: "",
};

interface Props {
  selection: DrillDownSelection;
  onChange: (next: DrillDownSelection) => void;
}

export default function StudentDrillDown({ selection, onChange }: Props) {
  const { periodId, dojang, programId, subProgramId } = selection;

  const dojangOptions = useMemo(
    () => (periodId ? getDojangsForPeriod(periodId) : []),
    [periodId],
  );
  const programOptions = useMemo(
    () => (periodId && dojang ? getProgramsForSelection(periodId, dojang) : []),
    [periodId, dojang],
  );
  const subProgramOptions = useMemo(
    () =>
      periodId && dojang && programId
        ? getSubProgramsForSelection(periodId, dojang, programId)
        : [],
    [periodId, dojang, programId],
  );

  return (
    <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        <Select
          label="Period"
          value={periodId}
          onChange={(e) =>
            onChange({
              periodId: e.target.value,
              dojang: "",
              programId: "",
              subProgramId: "",
            })
          }
        >
          <option value="">Pilih Period</option>
          {PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {formatPeriod(p)}
            </option>
          ))}
        </Select>
        <Select
          label="Dojang"
          value={dojang}
          onChange={(e) =>
            onChange({
              ...selection,
              dojang: e.target.value,
              programId: "",
              subProgramId: "",
            })
          }
          disabled={!periodId}
        >
          <option value="">
            {periodId ? "Pilih Dojang" : "Pilih Period dulu"}
          </option>
          {dojangOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
        <Select
          label="Program"
          value={programId}
          onChange={(e) =>
            onChange({
              ...selection,
              programId: e.target.value,
              subProgramId: "",
            })
          }
          disabled={!dojang}
        >
          <option value="">
            {dojang ? "Pilih Program" : "Pilih Dojang dulu"}
          </option>
          {programOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} · {p.name}
            </option>
          ))}
        </Select>
        <Select
          label="Sub Program"
          value={subProgramId}
          onChange={(e) =>
            onChange({ ...selection, subProgramId: e.target.value })
          }
          disabled={!programId}
        >
          <option value="">
            {programId ? "Pilih Sub Program" : "Pilih Program dulu"}
          </option>
          {subProgramOptions.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.id} · {sp.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
