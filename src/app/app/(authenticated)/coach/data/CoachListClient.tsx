// src/app/app/(authenticated)/coach/data/CoachListClient.tsx
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
  type Coach,
  getCoaches,
  subscribeCoaches,
  toggleCoachStatus,
} from "../_shared/coaches";
import { useDojangOptions } from "../../master/_shared/dojangs";
import { useSabukOptions } from "../../master/_shared/belts";

const PAGE_SIZE = 10;

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function fmtDate(iso: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`;
}

export default function CoachListClient() {
  const router = useRouter();
  const coaches = useSyncExternalStore(
    subscribeCoaches,
    getCoaches,
    getCoaches,
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
  const [confirming, setConfirming] = useState<Coach | null>(null);
  const [actionError, setActionError] = useState("");
  const handleToggleStatus = async () => {
    if (!confirming) return;
    const target = confirming;
    setConfirming(null);
    try {
      await toggleCoachStatus(target.username);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to update status",
      );
    }
  };

  const filtered = useMemo(
    () =>
      coaches.filter((c) => {
        const mNama =
          applied.nama === "" ||
          c.namaLengkap
            .toLowerCase()
            .includes(applied.nama.toLowerCase().trim());
        const mSabuk = applied.sabuk === "All" || c.sabuk === applied.sabuk;
        const mDojang = applied.dojang === "All" || c.dojang === applied.dojang;
        const mNo =
          applied.no === "" ||
          c.username.toLowerCase().includes(applied.no.toLowerCase().trim());
        return mNama && mSabuk && mDojang && mNo;
      }),
    [coaches, applied],
  );

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

  return (
    <>
      <PageHeader
        title="Coach&rsquo;s Data"
        actions={
          <Button onClick={() => router.push("/app/coach/data/new")}>
            <Plus size={16} />
            Add Coach
          </Button>
        }
      />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Input
            label="Nama"
            value={namaInput}
            onChange={(e) => setNamaInput(e.target.value)}
            placeholder="e.g. Marvin Hadi"
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
            placeholder="e.g. C0001"
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-6">
          {hasFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setNamaInput("");
                setSabukInput("All");
                setDojangInput("All");
                setNoInput("");
                setApplied({ nama: "", sabuk: "All", dojang: "All", no: "" });
                setPage(1);
              }}
            >
              Reset
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              setApplied({
                nama: namaInput,
                sabuk: sabukInput,
                dojang: dojangInput,
                no: noInput,
              });
              setPage(1);
            }}
          >
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
                {[
                  "Action",
                  "No. Reg",
                  "Nama Lengkap",
                  "Panggilan",
                  "Dojang",
                  "Sabuk",
                  "Tanggal Lahir",
                  "No Handphone 2",
                  "Warga Negara",
                  "NIK KTP / Paspor",
                  "Alamat Lengkap",
                  "Kode Pos",
                  "Tinggi Badan (cm)",
                  "Berat Badan (kg)",
                  "Ukuran Sepatu",
                  "Nama Ayah",
                  "Nama Ibu",
                  "Gol Darah",
                  "Alergi",
                  "Mulai Latihan",
                  "Status",
                  "Updated By",
                  "Update Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3.5 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={23}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No coaches found
                  </td>
                </tr>
              ) : (
                paginated.map((c) => {
                  const isActive = c.status === "Active";
                  return (
                    <tr
                      key={c.username}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              router.push(`/app/coach/data/${c.username}/edit`)
                            }
                            title="Update"
                            className="bg-accent text-accent-foreground p-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirming(c)}
                            title={isActive ? "Disable" : "Enable"}
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
                        {c.username}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.namaLengkap}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.panggilan || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.dojang}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.sabuk || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {fmtDate(c.tanggalLahir)}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {c.noHandphone2 || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.warganegara}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {c.nikKtpPaspor}
                      </td>
                      <td className="px-4 py-3 text-ink min-w-[280px]">
                        {c.alamatLengkap}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {c.kodePos}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.tinggiBadan}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.beratBadan}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.ukuranSepatu}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.namaAyah || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.namaIbu || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.golDarah}
                      </td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">
                        {c.alergi || "-"}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {fmtDate(c.mulaiLatihan)}
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
                            {c.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {c.updatedBy}
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {fmtDateTime(c.updateDate)}
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
          confirming?.status === "Inactive" ? "Enable Coach" : "Disable Coach"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable ${confirming.namaLengkap} (${confirming.username})?`
              : `Disable ${confirming.namaLengkap} (${confirming.username})?`
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
