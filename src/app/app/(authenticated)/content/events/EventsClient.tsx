// src/app/app/(authenticated)/content/events/EventsClient.tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import { useRole } from "@/lib/role-context";
import { getCurrentDisplayName } from "@/lib/current-user";
import { isBlobSrc } from "@/lib/cms/image-src";
import {
  useEvents,
  addEvent,
  updateEvent,
  toggleEventStatus,
  getNextEventId,
  formatEventDate,
  type EventItem,
  type EventStatus,
} from "@/lib/events";
import EventFormModal, { type EventFormValues } from "./EventFormModal";

type StatusFilter = "All" | EventStatus;

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function EventsClient() {
  const { role } = useRole();
  const currentUserName = getCurrentDisplayName(role);

  const events = useEvents();

  const [titleInput, setTitleInput] = useState("");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");
  const [applied, setApplied] = useState<{ title: string; status: StatusFilter }>(
    { title: "", status: "All" },
  );

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [confirming, setConfirming] = useState<EventItem | null>(null);
  const [viewing, setViewing] = useState<EventItem | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchTitle =
        applied.title === "" ||
        e.title.toLowerCase().includes(applied.title.toLowerCase());
      const matchStatus =
        applied.status === "All" || e.status === applied.status;
      return matchTitle && matchStatus;
    });
  }, [events, applied]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilter = applied.title !== "" || applied.status !== "All";

  const handleSearch = () => {
    setApplied({ title: titleInput, status: statusInput });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setTitleInput("");
    setStatusInput("All");
    setApplied({ title: "", status: "All" });
    setCurrentPage(1);
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (event: EventItem) => {
    setEditing(event);
    setFormOpen(true);
  };

  const handleSubmit = (values: EventFormValues) => {
    const now = new Date().toISOString();
    if (editing) {
      updateEvent(editing.id, {
        ...values,
        updatedBy: currentUserName,
        updateDate: now,
      });
    } else {
      addEvent({
        id: getNextEventId(),
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
    toggleEventStatus(confirming.id, currentUserName);
  };

  return (
    <>
      <PageHeader
        title="Events"
        description="Events shown on the marketing site and available as the homepage highlight."
        actions={
          <Button onClick={handleAdd}>
            <Plus size={16} />
            Add Event
          </Button>
        }
      />

      {/* filter card */}
      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Input
            label="Title"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="e.g. Ujian Kenaikan Tingkat"
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

      {/* data table */}
      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Title</th>
                <th className="text-left px-4 py-3.5">Date</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No events found
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
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewing(e)}
                          className="text-ink font-medium hover:text-brand underline underline-offset-4 decoration-ink/20 hover:decoration-brand transition-colors text-left"
                        >
                          {e.title}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap">
                        {formatEventDate(e.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              isActive ? "bg-emerald-500" : "bg-muted-foreground",
                            )}
                          />
                          <span className={isActive ? "text-ink" : "text-muted"}>
                            {e.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{e.updatedBy}</td>
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

      <EventFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        initial={editing}
        onSubmit={handleSubmit}
      />

      {/* Detail popup */}
      <Modal
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.title ?? ""}
        size="md"
      >
        {viewing && (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-paper-soft border border-ink/10">
              {viewing.image ? (
                <Image
                  src={viewing.image}
                  alt={viewing.title}
                  fill
                  unoptimized={isBlobSrc(viewing.image)}
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 480px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted uppercase tracking-widest text-xs font-bold">
                  No image
                </div>
              )}
            </div>
            <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
              <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Date
              </dt>
              <dd className="text-ink">{formatEventDate(viewing.date)}</dd>
              <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Register URL
              </dt>
              <dd className="text-ink break-all">{viewing.registerUrl}</dd>
              <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Description
              </dt>
              <dd className="text-ink/70">{viewing.description}</dd>
              <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Updated By
              </dt>
              <dd className="text-ink">{viewing.updatedBy}</dd>
              <dt className="font-display text-[11px] font-bold uppercase tracking-widest text-muted">
                Update Date
              </dt>
              <dd className="text-ink/70">{formatDateTime(viewing.updateDate)}</dd>
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        onConfirm={handleToggleStatus}
        title={
          confirming?.status === "Inactive" ? "Enable Event" : "Disable Event"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable "${confirming.title}"? It will reappear on the marketing site.`
              : `Disable "${confirming.title}"? It will be hidden from the marketing site.`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />
    </>
  );
}
