// src/app/app/(authenticated)/student/data/StudentListClient.tsx
"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Ban, Power } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import {
  type Student,
  getStudents,
  subscribeStudents,
  toggleStudentStatus,
} from "../_shared/students";
import { useDojangOptions } from "../../master/_shared/dojangs";
import { useSabukOptions } from "../../master/_shared/belts";

const PAGE_SIZE = 10;

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function fmtDate(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`;
}

export default function StudentListClient() {
  const router = useRouter();
  const students = useSyncExternalStore(
    subscribeStudents,
    getStudents,
    getStudents,
  );
  const dojangOptions = useDojangOptions();
  const sabukOptions = useSabukOptions();

  const [namaInput, setNamaInput] = useState("");
  const [sabukInput, setSabukInput] = useState("All");
  const [dojangInput, setDojangInput] = useState("All");
  const [noInput, setNoInput] = useState("");
  const [applied, setApplied] = useState({
    nama: "",
    sabuk: "All",
    dojang: "All",
    no: "",
  });

  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<Student | null>(null);
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchNama =
        applied.nama === "" ||
        s.namaLengkap.toLowerCase().includes(applied.nama.toLowerCase().trim());
      const matchSabuk = applied.sabuk === "All" || s.sabuk === applied.sabuk;
      const matchDojang =
        applied.dojang === "All" || s.dojang === applied.dojang;
      const matchNo =
        applied.no === "" ||
        s.username.toLowerCase().includes(applied.no.toLowerCase().trim());
      return matchNama && matchSabuk && matchDojang && matchNo;
    });
  }, [students, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const hasFilter =
    applied.nama !== "" ||
    applied.sabuk !== "All" ||
    applied.dojang !== "All" ||
    applied.no !== "";

  const handleSearch = () => {
    setApplied({
      nama: namaInput,
      sabuk: sabukInput,
      dojang: dojangInput,
      no: noInput,
    });
    setPage(1);
  };
  const handleReset = () => {
    setNamaInput("");
    setSabukInput("All");
    setDojangInput("All");
    setNoInput("");
    setApplied({ nama: "", sabuk: "All", dojang: "All", no: "" });
    setPage(1);
  };
  const handleAdd = () => router.push("/app/student/data/new");
  const handleEdit = (s: Student) =>
    router.push(`/app/student/data/${s.username}/edit`);
  const handleToggleStatus = async () => {
    if (!confirming) return;
    const target = confirming;
    setConfirming(null);
    try {
      await toggleStudentStatus(target.username);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to update status",
      );
    }
  };

  return (
    <>
      <PageHeader
        title="Student&rsquo;s Data"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Student
          </Button>
        }
      />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Input
            label="Nama"
            value={namaInput}
            onChange={(e) => setNamaInput(e.target.value)}
            placeholder="e.g. Devaloka Gangga"
          />
          <Select
            label="Dojang"
            value={dojangInput}
            onChange={(e) => setDojangInput(e.target.value)}
          >
            <option value="All">All</option>
            {dojangOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
          <Select
            label="Sabuk"
            value={sabukInput}
            onChange={(e) => setSabukInput(e.target.value)}
          >
            <option value="All">All</option>
            {sabukOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input
            label="No. Reg"
            value={noInput}
            onChange={(e) => setNoInput(e.target.value)}
            placeholder="e.g. U0006"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          {hasFilter && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          )}
          <Button variant="secondary" onClick={handleSearch}>
            <Search size={16} />
            Search
          </Button>
        </div>
      </div>

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Action
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  No. Reg
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Nama Lengkap
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Panggilan
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Dojang
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Sabuk
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Tanggal Lahir
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  No Handphone 2
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Warga Negara
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  NIK KTP / Paspor
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Alamat Lengkap
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Kode Pos
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Tinggi Badan (cm)
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Berat Badan (kg)
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Ukuran Sepatu
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Nama Ayah
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Nama Ibu
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Gol Darah
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Alergi
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Mulai Latihan
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Status
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Updated By
                </th>
                <th className="text-left px-4 py-3.5 whitespace-nowrap">
                  Update Date
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={23}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No students found
                  </td>
                </tr>
              ) : (
                paginated.map((s) => {
                  const isActive = s.status === "Active";
                  return (
                    <tr
                      key={s.username}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(s)}
                            title="Update"
                            aria-label={`Update ${s.namaLengkap}`}
                            className="bg-accent text-accent-foreground p-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirming(s)}
                            title={isActive ? "Disable" : "Enable"}
                            aria-label={`${isActive ? "Disable" : "Enable"} ${s.namaLengkap}`}
                            className={cn(
                              "p-1.5 rounded-sm transition",
                              isActive
                                ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                                : "bg-ink text-paper hover:bg-ink-soft",
                            )}
                          >
                            {isActive ? <Ban size={14} /> : <Power size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink font-medium whitespace-nowrap">
                        {s.username}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.namaLengkap}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.panggilan || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.dojang}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.sabuk || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {fmtDate(s.tanggalLahir)}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.noHandphone2 || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.warganegara}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.nikKtpPaspor}
                      </td>
                      <td className="px-4 py-3 text-ink min-w-[280px]">
                        {s.alamatLengkap}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.kodePos}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.tinggiBadan}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.beratBadan}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.ukuranSepatu}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.namaAyah || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.namaIbu || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.golDarah}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {s.alergi || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {fmtDate(s.mulaiLatihan)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isActive
                                ? "bg-emerald-500"
                                : "bg-muted-foreground",
                            )}
                          />
                          <span
                            className={isActive ? "text-ink" : "text-muted"}
                          >
                            {s.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {s.updatedBy}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {fmtDateTime(s.updateDate)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="border-t border-ink/10 px-4 py-3 bg-paper-soft">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={handleToggleStatus}
        title={
          confirming?.status === "Inactive"
            ? "Enable Student"
            : "Disable Student"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable ${confirming.namaLengkap} (${confirming.username})? They will return to active status.`
              : `Disable ${confirming.namaLengkap} (${confirming.username})? They will be marked inactive.`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />

      <Modal
        open={actionError !== ""}
        onClose={() => setActionError("")}
        title="Cannot Update Status"
        size="sm"
      >
        <p className="text-sm text-ink/80">{actionError}</p>
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => setActionError("")}>
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
