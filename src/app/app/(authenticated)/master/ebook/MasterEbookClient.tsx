// src/app/app/(authenticated)/master/ebook/MasterEbookClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import EbookFormModal, { type EbookFormValues } from "./EbookFormModal";
import {
  getEbooks,
  subscribeEbooks,
  getNextEbookId,
  addEbook,
  updateEbook,
  toggleEbookStatus,
  type Ebook,
  type EbookStatus,
} from "../_shared/ebooks";
import { SABUK_OPTIONS } from "../../student/_shared/students";

type StatusFilter = "All" | EbookStatus;

function fmtDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterEbookClient() {
  const currentUserName = "Carolina";
  const ebooks = useSyncExternalStore(subscribeEbooks, getEbooks, getEbooks);

  const [sabukInput, setSabukInput] = useState("All");
  const [titleInput, setTitleInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");
  const [applied, setApplied] = useState({
    sabuk: "All",
    title: "",
    status: "All" as StatusFilter,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Ebook | null>(null);
  const [confirming, setConfirming] = useState<Ebook | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return ebooks.filter((e) => {
      const matchSabuk = applied.sabuk === "All" || e.sabuk === applied.sabuk;
      const matchTitle =
        applied.title === "" ||
        e.title.toLowerCase().includes(applied.title.toLowerCase().trim());
      const matchStatus =
        applied.status === "All" || e.status === applied.status;
      return matchSabuk && matchTitle && matchStatus;
    });
  }, [ebooks, applied]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilter =
    applied.sabuk !== "All" || applied.title !== "" || applied.status !== "All";

  const handleSearch = () => {
    setApplied({
      sabuk: sabukInput,
      title: titleInput,
      status: statusInput,
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSabukInput("All");
    setTitleInput("");
    setStatusInput("All");
    setApplied({ sabuk: "All", title: "", status: "All" });
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (e: Ebook) => {
    setEditing(e);
    setFormOpen(true);
  };

  const handleSubmit = (values: EbookFormValues) => {
    const now = new Date().toISOString();
    if (editing) {
      updateEbook(editing.id, {
        ...values,
        updatedBy: currentUserName,
        updateDate: now,
      });
    } else {
      addEbook({
        id: getNextEbookId(),
        ...values,
        status: "Active",
        updatedBy: currentUserName,
        updateDate: now,
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const handleToggleStatus = () => {
    if (!confirming) return;
    toggleEbookStatus(confirming.id, currentUserName);
  };

  return (
    <>
      <PageHeader
        title="Master E-Book"
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add E-Book
          </Button>
        }
      />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
          <Select
            label="Sabuk"
            value={sabukInput}
            onChange={(e) => setSabukInput(e.target.value)}
          >
            <option value="All">All</option>
            {SABUK_OPTIONS.filter((s) => s !== "-").map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input
            label="Title"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="e.g. Cara Menendang"
          />
          <Select
            label="Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as StatusFilter)}
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Sabuk</th>
                <th className="text-left px-4 py-3.5">Title</th>
                <th className="text-left px-4 py-3.5">PDF File</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No e-books found
                  </td>
                </tr>
              ) : (
                paginated.map((e) => {
                  const isActive = e.status === "Active";
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink">{e.sabuk}</td>
                      <td className="px-4 py-3 text-ink">{e.title}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`/ebooks/${e.pdfFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand hover:text-brand-hover underline underline-offset-4 font-mono text-xs"
                        >
                          {e.pdfFile}
                        </a>
                      </td>
                      <td className="px-4 py-3">
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
                            {e.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{e.updatedBy}</td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {fmtDate(e.updateDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(e)}
                            className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setConfirming(e)}
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm transition",
                              isActive
                                ? "bg-brand text-brand-foreground hover:bg-brand-hover"
                                : "bg-ink text-paper hover:bg-ink-soft",
                            )}
                          >
                            {isActive ? "Disable" : "Enable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {totalItems > 0 && (
          <div className="px-4 py-4 border-t border-ink/10 bg-paper">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <EbookFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={handleToggleStatus}
        title={
          confirming?.status === "Inactive" ? "Enable E-Book" : "Disable E-Book"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable "${confirming.title}"? It will become visible to students.`
              : `Disable "${confirming.title}"? It will be hidden from students.`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />
    </>
  );
}
