// src/app/app/(authenticated)/certificate/AddCertificateClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, X, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/app/PageHeader";
import {
  getStudents,
  subscribeStudents,
} from "../student/_shared/students";
import { getCoaches, subscribeCoaches } from "../coach/_shared/coaches";
import {
  type CertRecipientType,
  getCertifications,
  subscribeCertifications,
  addCertification,
  getNextCertId,
  formatCertDate,
} from "@/lib/certifications";

const DEFAULT_IMAGE = "/images/event-ukt-promo.jpg";
const MAX_RESULTS = 8;

type Recipient = { username: string; name: string; meta: string };

export default function AddCertificateClient() {
  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );
  const coaches = useSyncExternalStore(
    subscribeCoaches,
    getCoaches,
    getCoaches,
  );
  const certifications = useSyncExternalStore(
    subscribeCertifications,
    getCertifications,
    getCertifications,
  );

  const [recipientType, setRecipientType] =
    useState<CertRecipientType>("student");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Recipient | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [errors, setErrors] = useState<{
    recipient?: string;
    title?: string;
    date?: string;
  }>({});
  const [done, setDone] = useState(false);

  const nameByUsername = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => map.set(s.username, s.namaLengkap));
    coaches.forEach((c) => map.set(c.username, c.namaLengkap));
    return map;
  }, [students, coaches]);

  const results = useMemo<Recipient[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const pool: Recipient[] =
      recipientType === "student"
        ? students.map((s) => ({
            username: s.username,
            name: s.namaLengkap,
            meta: `${s.dojang} · ${s.sabuk}`,
          }))
        : coaches.map((c) => ({
            username: c.username,
            name: c.namaLengkap,
            meta: `${c.dojang} · ${c.sabuk}`,
          }));
    return pool
      .filter(
        (r) =>
          r.username.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  }, [query, recipientType, students, coaches]);

  const switchType = (t: CertRecipientType) => {
    setRecipientType(t);
    setSelected(null);
    setQuery("");
  };

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!selected) next.recipient = "Pilih penerima";
    if (!title.trim()) next.title = "Required";
    if (!date) next.date = "Required";
    setErrors(next);
    if (Object.keys(next).length > 0 || !selected) return;

    addCertification({
      id: getNextCertId(),
      recipientType,
      recipientUsername: selected.username,
      title: title.trim(),
      date,
      description: description.trim(),
      thumbnail: image.trim() || DEFAULT_IMAGE,
      fullImage: image.trim() || DEFAULT_IMAGE,
    });
    setDone(true);
    setTitle("");
    setDate("");
    setDescription("");
    setImage("");
  };

  return (
    <>
      <PageHeader
        title="Add Certificate"
        description="Buat sertifikat untuk student atau coach."
      />

      <div className="max-w-2xl space-y-6">
        <section className="bg-paper rounded-sm border border-ink/10 p-6 space-y-5">
          {/* Recipient type */}
          <div>
            <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink mb-2 block">
              Penerima
            </label>
            <div className="inline-flex rounded-sm border border-ink/15 overflow-hidden">
              {(["student", "coach"] as CertRecipientType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchType(t)}
                  className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors",
                    recipientType === t
                      ? "bg-brand text-brand-foreground"
                      : "bg-paper text-ink hover:bg-paper-soft",
                  )}
                >
                  {t === "student" ? "Student" : "Coach"}
                </button>
              ))}
            </div>
          </div>

          {/* Recipient picker */}
          {selected ? (
            <div className="flex items-center justify-between gap-4 rounded-sm border border-ink/10 bg-paper-soft px-4 py-3">
              <div>
                <p className="text-ink font-medium">{selected.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {selected.username} · {selected.meta}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
              >
                <X size={14} /> Ganti
              </Button>
            </div>
          ) : (
            <div>
              <Input
                label="Cari (No. Reg / Nama)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  recipientType === "student"
                    ? "e.g. U0006 atau Devaloka"
                    : "e.g. C0001 atau Marvin"
                }
                error={errors.recipient}
              />
              {query.trim() !== "" && (
                <div className="mt-2 rounded-sm border border-ink/10 overflow-hidden divide-y divide-ink/5">
                  {results.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-muted">
                      Tidak ada hasil.
                    </p>
                  ) : (
                    results.map((r) => (
                      <button
                        key={r.username}
                        onClick={() => {
                          setSelected(r);
                          setQuery("");
                          setErrors((e) => ({ ...e, recipient: undefined }));
                        }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-paper-soft transition-colors"
                      >
                        <span className="text-sm text-ink">{r.name}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60 bg-paper-soft border border-ink/10 rounded-sm px-1.5 py-0.5">
                          {r.username}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Certificate fields */}
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder="e.g. Kejuaraan Nasional Taekwondo 2026"
          />
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
          <div className="flex flex-col gap-2">
            <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Deskripsi singkat pencapaian..."
              className="rounded-sm border border-ink/15 bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/40 transition-colors"
            />
          </div>
          <Input
            label="Image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="e.g. /images/event-ukt-promo.jpg"
          />

          <div className="flex justify-end pt-1">
            <Button variant="primary" onClick={handleSubmit}>
              <Award size={16} /> Add Certificate
            </Button>
          </div>

          {done && (
            <div className="flex items-start gap-3 rounded-sm bg-emerald-500/10 border border-emerald-500/30 px-4 py-3">
              <Check size={18} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-ink">Sertifikat berhasil dibuat.</p>
            </div>
          )}
        </section>

        {/* Existing certificates */}
        <section className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
          <div className="px-6 py-4 bg-paper-soft border-b border-ink/10 font-display text-sm font-bold uppercase tracking-widest text-ink">
            Existing Certificates
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <th className="text-left px-4 py-3">Recipient</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {certifications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center px-4 py-10 text-muted uppercase tracking-widest text-xs font-bold"
                    >
                      No certificates yet
                    </td>
                  </tr>
                ) : (
                  certifications.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-ink/5 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-ink">
                        {nameByUsername.get(c.recipientUsername) ??
                          c.recipientUsername}
                        <span className="text-muted text-xs ml-1">
                          ({c.recipientUsername})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70 capitalize">
                        {c.recipientType}
                      </td>
                      <td className="px-4 py-3 text-ink">{c.title}</td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {formatCertDate(c.date)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
