// src/app/app/(authenticated)/admin/AdminListClient.tsx
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
  type Admin,
  getAdmins,
  subscribeAdmins,
  toggleAdminStatus,
} from "./_shared/admins";
import { useDojangOptions } from "../master/_shared/dojangs";

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

export default function AdminListClient() {
  const router = useRouter();

  // Reactive read from the cross-page store.
  const admins = useSyncExternalStore(subscribeAdmins, getAdmins, getAdmins);
  const dojangOptions = useDojangOptions();

  // Filter: input state vs applied state.
  const [namaInput, setNamaInput] = useState("");
  const [dojangInput, setDojangInput] = useState("All");
  const [applied, setApplied] = useState<{ nama: string; dojang: string }>({
    nama: "",
    dojang: "All",
  });

  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<Admin | null>(null);
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    return admins.filter((a) => {
      const matchNama =
        applied.nama === "" ||
        a.namaLengkap.toLowerCase().includes(applied.nama.toLowerCase().trim());
      const matchDojang =
        applied.dojang === "All" || a.dojang === applied.dojang;
      return matchNama && matchDojang;
    });
  }, [admins, applied]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const startIdx = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filtered, safePage]);

  const hasFilter = applied.nama !== "" || applied.dojang !== "All";

  const handleSearch = () => {
    setApplied({ nama: namaInput, dojang: dojangInput });
    setPage(1);
  };

  const handleReset = () => {
    setNamaInput("");
    setDojangInput("All");
    setApplied({ nama: "", dojang: "All" });
    setPage(1);
  };

  const handleAdd = () => router.push("/app/admin/new");
  const handleEdit = (a: Admin) => router.push(`/app/admin/${a.username}/edit`);

  const handleToggleStatus = async () => {
    if (!confirming) return;
    const target = confirming;
    setConfirming(null);
    try {
      await toggleAdminStatus(target.username);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to update status",
      );
    }
  };

  return (
    <>
      <PageHeader
        title="Admin Data"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Member
          </Button>
        }
      />

      {/* Filter card */}
      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Input
            label="Nama"
            value={namaInput}
            onChange={(e) => setNamaInput(e.target.value)}
            placeholder="e.g. Fathir"
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

      {/* Table */}
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
                    No admins found
                  </td>
                </tr>
              ) : (
                paginated.map((a) => {
                  const isActive = a.status === "Active";
                  return (
                    <tr
                      key={a.username}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleEdit(a)}
                            title="Update"
                            aria-label={`Update ${a.namaLengkap}`}
                            className="bg-accent text-accent-foreground p-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirming(a)}
                            title={isActive ? "Disable" : "Enable"}
                            aria-label={`${isActive ? "Disable" : "Enable"} ${a.namaLengkap}`}
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
                        {a.username}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.namaLengkap}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.panggilan || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.dojang}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.sabuk || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {fmtDate(a.tanggalLahir)}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {a.noHandphone2 || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.warganegara}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {a.nikKtpPaspor}
                      </td>
                      <td className="px-4 py-3 text-ink min-w-[280px]">
                        {a.alamatLengkap}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {a.kodePos}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.tinggiBadan}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.beratBadan}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.ukuranSepatu}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.namaAyah || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.namaIbu || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.golDarah}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {a.alergi || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {fmtDate(a.mulaiLatihan)}
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
                            {a.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {a.updatedBy}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {fmtDateTime(a.updateDate)}
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
          confirming?.status === "Inactive" ? "Enable Admin" : "Disable Admin"
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
