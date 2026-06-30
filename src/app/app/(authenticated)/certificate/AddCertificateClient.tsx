// src/app/app/(authenticated)/certificate/AddCertificateClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, Award, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  fetchCertif,
  fetchUserCertifEntry,
  saveCertif,
  deleteCertif,
  formatCertDate,
  type CertifRow,
  type UserCertifEntryRow,
} from "@/lib/api/certifications";

const MAX_RESULTS = 8;
const PAGE_SIZE = 10;

type RecipientType = "student" | "coach";
const TYPE_CODE: Record<RecipientType, string> = { student: "S", coach: "I" };

type ListTypeFilter = "All" | "S" | "I";

export default function AddCertificateClient() {
  const [entries, setEntries] = useState<UserCertifEntryRow[]>([]);
  const [certifications, setCertifications] = useState<CertifRow[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const [recipientType, setRecipientType] = useState<RecipientType>("student");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<UserCertifEntryRow | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{
    recipient?: string;
    title?: string;
    date?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState<CertifRow | null>(null);

  // ---- existing-certificates list: search + pagination ----
  const [listNameInput, setListNameInput] = useState("");
  const [listTypeInput, setListTypeInput] = useState<ListTypeFilter>("All");
  const [listApplied, setListApplied] = useState<{
    name: string;
    type: ListTypeFilter;
  }>({ name: "", type: "All" });
  const [listPage, setListPage] = useState(1);

  const reloadCertifications = () => {
    setListLoading(true);
    fetchCertif()
      .then((rows) => setCertifications(rows ?? []))
      .catch(() => setCertifications([]))
      .finally(() => setListLoading(false));
  };

  useEffect(() => {
    let alive = true;
    fetchUserCertifEntry()
      .then((rows) => {
        if (alive) setEntries(rows ?? []);
      })
      .catch(() => {
        if (alive) setEntries([]);
      });
    fetchCertif()
      .then((rows) => {
        if (alive) setCertifications(rows ?? []);
      })
      .catch(() => {
        if (alive) setCertifications([]);
      })
      .finally(() => {
        if (alive) setListLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo<UserCertifEntryRow[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const code = TYPE_CODE[recipientType];
    return entries
      .filter((e) => e.UserTypeCode === code)
      .filter(
        (e) =>
          (e.UserNoId ?? "").toLowerCase().includes(q) ||
          (e.UserName ?? "").toLowerCase().includes(q),
      )
      .slice(0, MAX_RESULTS);
  }, [query, recipientType, entries]);

  const filteredCertifs = useMemo(() => {
    const q = listApplied.name.trim().toLowerCase();
    return certifications.filter((c) => {
      const matchType =
        listApplied.type === "All" || c.UserTypeCode === listApplied.type;
      const matchName =
        q === "" ||
        (c.UserName ?? "").toLowerCase().includes(q) ||
        (c.UserNoId ?? "").toLowerCase().includes(q);
      return matchType && matchName;
    });
  }, [certifications, listApplied]);

  const listTotalPages = Math.max(
    1,
    Math.ceil(filteredCertifs.length / PAGE_SIZE),
  );
  const listSafePage = Math.min(listPage, listTotalPages);
  const paginatedCertifs = useMemo(() => {
    const start = (listSafePage - 1) * PAGE_SIZE;
    return filteredCertifs.slice(start, start + PAGE_SIZE);
  }, [filteredCertifs, listSafePage]);

  const hasListFilter =
    listApplied.name !== "" || listApplied.type !== "All";

  const handleListSearch = () => {
    setListApplied({ name: listNameInput, type: listTypeInput });
    setListPage(1);
  };
  const handleListReset = () => {
    setListNameInput("");
    setListTypeInput("All");
    setListApplied({ name: "", type: "All" });
    setListPage(1);
  };

  const switchType = (t: RecipientType) => {
    setRecipientType(t);
    setSelected(null);
    setQuery("");
  };

  const resetForm = () => {
    setTitle("");
    setDate("");
    setDescription("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    const next: typeof errors = {};
    if (!selected) next.recipient = "Pilih penerima";
    if (!title.trim()) next.title = "Required";
    if (!date) next.date = "Required";
    setErrors(next);
    if (Object.keys(next).length > 0 || !selected) return;

    setSaving(true);
    setDone(false);
    setSaveError("");
    try {
      await saveCertif(
        {
          CertifId: 0,
          UserDataId: selected.UserDataId,
          CertifTitle: title.trim(),
          CertifDesc: description.trim(),
          CertifDate: date,
          FgMode: "I",
        },
        file,
      );
      setDone(true);
      resetForm();
      reloadCertifications();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save certificate",
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const id = deleting.CertifId;
    setDeleting(null);
    try {
      await deleteCertif(id);
      reloadCertifications();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to delete certificate",
      );
    }
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
              {(["student", "coach"] as RecipientType[]).map((t) => (
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
                <p className="text-ink font-medium">{selected.UserName}</p>
                <p className="text-xs text-muted mt-0.5">{selected.UserNoId}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
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
                    ? "e.g. NS00001 atau Nando"
                    : "e.g. NI00001 atau Cibaido"
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
                        key={r.UserDataId}
                        onClick={() => {
                          setSelected(r);
                          setQuery("");
                          setErrors((e) => ({ ...e, recipient: undefined }));
                        }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-paper-soft transition-colors"
                      >
                        <span className="text-sm text-ink">{r.UserName}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/60 bg-paper-soft border border-ink/10 rounded-sm px-1.5 py-0.5">
                          {r.UserNoId}
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
          <div className="flex flex-col gap-2">
            <label className="font-display text-[11px] font-bold uppercase tracking-widest text-ink">
              Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-ink file:mr-3 file:rounded-sm file:border file:border-ink/15 file:bg-paper-soft file:px-3 file:py-1.5 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-ink hover:file:bg-paper"
            />
            {file && (
              <p className="text-xs text-muted">Selected: {file.name}</p>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              <Award size={16} /> {saving ? "Saving…" : "Add Certificate"}
            </Button>
          </div>

          {done && (
            <div className="flex items-start gap-3 rounded-sm bg-emerald-500/10 border border-emerald-500/30 px-4 py-3">
              <Check size={18} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm text-ink">Sertifikat berhasil dibuat.</p>
            </div>
          )}
          {saveError && (
            <div className="flex items-start gap-3 rounded-sm bg-brand/10 border border-brand/30 px-4 py-3">
              <X size={18} className="text-brand mt-0.5 shrink-0" />
              <p className="text-sm text-ink">{saveError}</p>
            </div>
          )}
        </section>

        {/* Existing certificates */}
        <section className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
          <div className="px-6 py-4 bg-paper-soft border-b border-ink/10 font-display text-sm font-bold uppercase tracking-widest text-ink">
            Existing Certificates
          </div>

          {/* Filter bar */}
          <div className="px-6 py-4 border-b border-ink/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Input
                label="Nama / No. Reg"
                value={listNameInput}
                onChange={(e) => setListNameInput(e.target.value)}
                placeholder="e.g. Nando atau NS00001"
              />
              <Select
                label="Type"
                value={listTypeInput}
                onChange={(e) =>
                  setListTypeInput(e.target.value as ListTypeFilter)
                }
              >
                <option value="All">All</option>
                <option value="S">Student</option>
                <option value="I">Coach</option>
              </Select>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              {hasListFilter && (
                <Button variant="ghost" size="sm" onClick={handleListReset}>
                  Reset
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={handleListSearch}>
                <Search size={16} />
                Search
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                  <th className="text-left px-4 py-3">Recipient</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {listLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-4 py-10 text-muted uppercase tracking-widest text-xs font-bold"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : paginatedCertifs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center px-4 py-10 text-muted uppercase tracking-widest text-xs font-bold"
                    >
                      {hasListFilter
                        ? "No certificates match your filter"
                        : "No certificates yet"}
                    </td>
                  </tr>
                ) : (
                  paginatedCertifs.map((c) => (
                    <tr
                      key={c.CertifId}
                      className="border-b border-ink/5 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-ink">
                        {c.UserName ?? "-"}
                        <span className="text-muted text-xs ml-1">
                          ({c.UserNoId})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        {c.UserTypeCode === "S"
                          ? "Student"
                          : c.UserTypeCode === "I"
                            ? "Coach"
                            : "-"}
                      </td>
                      <td className="px-4 py-3 text-ink">{c.CertifTitle}</td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {formatCertDate(c.CertifDate)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setDeleting(c)}
                          title="Delete"
                          className="bg-brand text-brand-foreground p-1.5 rounded-sm hover:bg-brand-hover transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!listLoading && filteredCertifs.length > 0 && (
            <div className="border-t border-ink/10 px-4 py-3 bg-paper-soft">
              <Pagination
                currentPage={listSafePage}
                totalPages={listTotalPages}
                totalItems={filteredCertifs.length}
                pageSize={PAGE_SIZE}
                onPageChange={setListPage}
              />
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete Certificate"
        description={
          deleting
            ? `Delete "${deleting.CertifTitle}" for ${deleting.UserName ?? deleting.UserNoId}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  );
}
