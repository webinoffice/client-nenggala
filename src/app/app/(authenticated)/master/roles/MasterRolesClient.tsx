// src/app/app/(authenticated)/master/roles/MasterRolesClient.tsx
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Search, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/roles";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageHeader from "@/components/app/PageHeader";
import Pagination from "@/components/app/Pagination";
import UserFormModal, { type UserFormValues } from "./UserFormModal";
import {
  getAppUsers,
  subscribeAppUsers,
  updateAppUser,
  toggleAppUserStatus,
  type AppUser,
  type UserStatus,
} from "../_shared/app-users";

type StatusFilter = "All" | UserStatus;
type RoleFilter = "All" | Role;

function formatDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function MasterRolesClient() {
  const currentUserName = "Carolina";

  const users = useSyncExternalStore(
    subscribeAppUsers,
    getAppUsers,
    getAppUsers,
  );

  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState<RoleFilter>("All");
  const [statusInput, setStatusInput] = useState<StatusFilter>("All");

  const [applied, setApplied] = useState<{
    name: string;
    role: RoleFilter;
    status: StatusFilter;
  }>({ name: "", role: "All", status: "All" });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [confirming, setConfirming] = useState<AppUser | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchName =
        applied.name === "" ||
        u.name.toLowerCase().includes(applied.name.toLowerCase());
      const matchRole = applied.role === "All" || u.role === applied.role;
      const matchStatus =
        applied.status === "All" || u.status === applied.status;
      return matchName && matchRole && matchStatus;
    });
  }, [users, applied]);

  // derived pagination values
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilter =
    applied.name !== "" || applied.role !== "All" || applied.status !== "All";

  const handleSearch = () => {
    setApplied({ name: nameInput, role: roleInput, status: statusInput });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setNameInput("");
    setRoleInput("All");
    setStatusInput("All");
    setApplied({ name: "", role: "All", status: "All" });
    setCurrentPage(1);
  };

  const handleEdit = (user: AppUser) => {
    setEditing(user);
    setFormOpen(true);
  };

  const togglePasswordReveal = (id: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (values: UserFormValues) => {
    if (!editing) return;
    const now = new Date().toISOString();
    // Only password and role can change.
    updateAppUser(editing.id, {
      role: values.role,
      password:
        values.password.trim() === "" ? editing.password : values.password,
      updatedBy: currentUserName,
      updateDate: now,
    });
    setFormOpen(false);
    setEditing(null);
  };

  const handleToggleStatus = () => {
    if (!confirming) return;
    toggleAppUserStatus(confirming.id, currentUserName);
  };

  return (
    <>
      <PageHeader title="Master Roles" />

      <div className="bg-paper rounded-sm border border-ink/10 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Input
            label="Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="e.g. Fathir"
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
          <Select
            label="Role"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value as RoleFilter)}
          >
            <option value="All">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
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

      <div className="bg-paper rounded-sm border border-ink/10 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-ink/15 bg-paper-soft font-display text-[11px] font-bold uppercase tracking-widest text-ink/70">
                <th className="text-left px-4 py-3.5">Name</th>
                <th className="text-left px-4 py-3.5">Username</th>
                <th className="text-left px-4 py-3.5">Password</th>
                <th className="text-left px-4 py-3.5">Role</th>
                <th className="text-left px-4 py-3.5">Status</th>
                <th className="text-left px-4 py-3.5">Updated By</th>
                <th className="text-left px-4 py-3.5">Update Date</th>
                <th className="text-right px-4 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center px-4 py-16 text-muted uppercase tracking-widest text-xs font-bold"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isActive = u.status === "Active";
                  const isRevealed = revealed.has(u.id);
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-ink/5 hover:bg-paper-soft/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-ink">{u.name}</td>
                      <td className="px-4 py-3 text-ink/70 font-mono text-xs">
                        {u.username}
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-mono text-xs">
                            {isRevealed ? u.password : "••••••••"}
                          </span>
                          <button
                            onClick={() => togglePasswordReveal(u.id)}
                            className="text-muted hover:text-ink transition-colors"
                            aria-label={
                              isRevealed ? "Hide password" : "Show password"
                            }
                          >
                            {isRevealed ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink">
                        {ROLE_LABELS[u.role]}
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
                            {u.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{u.updatedBy}</td>
                      <td className="px-4 py-3 text-ink/70 whitespace-nowrap text-xs">
                        {formatDate(u.updateDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm hover:brightness-95 transition"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => setConfirming(u)}
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
        {/* pagination footer */}
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

      <UserFormModal
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
          confirming?.status === "Inactive" ? "Enable User" : "Disable User"
        }
        description={
          confirming
            ? confirming.status === "Inactive"
              ? `Enable "${confirming.name}" (${confirming.username})? They will regain access.`
              : `Disable "${confirming.name}" (${confirming.username})? They will lose access until re-enabled.`
            : ""
        }
        confirmLabel={confirming?.status === "Inactive" ? "Enable" : "Disable"}
        variant={confirming?.status === "Inactive" ? "primary" : "destructive"}
      />
    </>
  );
}
