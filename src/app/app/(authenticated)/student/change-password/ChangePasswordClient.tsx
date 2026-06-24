// src/app/app/(authenticated)/student/change-password/ChangePasswordClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { KeyRound, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/app/PageHeader";
import {
  type Student,
  getStudents,
  subscribeStudents,
} from "../_shared/students";

const MAX_RESULTS = 8;
const MIN_PASSWORD = 6;

export default function ChangePasswordClient() {
  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>(
    {},
  );
  const [done, setDone] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter(
        (s) =>
          s.username.toLowerCase().includes(q) ||
          s.namaLengkap.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  }, [students, query]);

  const handleSelect = (s: Student) => {
    setSelected(s);
    setQuery("");
    setPassword("");
    setConfirm("");
    setErrors({});
    setDone(false);
  };

  const handleClear = () => {
    setSelected(null);
    setPassword("");
    setConfirm("");
    setErrors({});
    setDone(false);
  };

  const handleSubmit = () => {
    const next: { password?: string; confirm?: string } = {};
    if (password.length < MIN_PASSWORD)
      next.password = `Minimal ${MIN_PASSWORD} karakter`;
    if (confirm !== password) next.confirm = "Password tidak cocok";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    // Mock: in production this would call the API to reset the student's password.
    setDone(true);
  };

  return (
    <>
      <PageHeader
        title="Reset Student Password"
        description="Cari student berdasarkan No. Reg atau nama, lalu atur password baru."
      />

      <div className="max-w-2xl space-y-6">
        {/* Step 1 — pick a student */}
        <section className="bg-paper rounded-sm border border-ink/10 p-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-4">
            1. Pilih Student
          </h2>

          {selected ? (
            <div className="flex items-center justify-between gap-4 rounded-sm border border-ink/10 bg-paper-soft px-4 py-3">
              <div>
                <p className="text-ink font-medium">{selected.namaLengkap}</p>
                <p className="text-xs text-muted mt-0.5">
                  {selected.username} · {selected.dojang} · {selected.sabuk}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X size={14} /> Ganti
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Input
                label="Cari Student"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. U0006 atau Devaloka"
              />
              {query.trim() !== "" && (
                <div className="mt-2 rounded-sm border border-ink/10 overflow-hidden divide-y divide-ink/5">
                  {results.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-muted">
                      Tidak ada student yang cocok.
                    </p>
                  ) : (
                    results.map((s) => (
                      <button
                        key={s.username}
                        onClick={() => handleSelect(s)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-paper-soft transition-colors"
                      >
                        <span className="text-sm text-ink">
                          {s.namaLengkap}
                        </span>
                        <span className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-muted">{s.dojang}</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60 bg-paper-soft border border-ink/10 rounded-sm px-1.5 py-0.5">
                            {s.username}
                          </span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Step 2 — set new password */}
        {selected && (
          <section
            className={cn(
              "bg-paper rounded-sm border border-ink/10 p-6",
              done && "opacity-100",
            )}
          >
            <h2 className="font-display text-sm font-bold uppercase tracking-widest text-ink mb-4">
              2. Password Baru
            </h2>

            {done ? (
              <div className="flex items-start gap-3 rounded-sm bg-emerald-500/10 border border-emerald-500/30 px-4 py-3">
                <Check size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-ink font-medium">
                    Password untuk {selected.namaLengkap} ({selected.username})
                    berhasil diatur ulang.
                  </p>
                  <p className="text-xs text-muted mt-1">
                    Sampaikan password baru ke student secara aman.
                  </p>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" onClick={handleClear}>
                      Reset student lain
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Password Baru"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  placeholder="Minimal 6 karakter"
                  autoComplete="new-password"
                />
                <Input
                  label="Konfirmasi Password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  error={errors.confirm}
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                />
                <div className="flex justify-end pt-1">
                  <Button variant="primary" onClick={handleSubmit}>
                    <KeyRound size={16} /> Atur Ulang Password
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
