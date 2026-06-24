// src/app/app/(authenticated)/master/roles/UserFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/roles";
import type { AppUser } from "../_shared/app-users";

export type UserFormValues = {
  password: string;
  role: Role;
};

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: AppUser | null;
  onSubmit: (values: UserFormValues) => void;
}

export default function UserFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: UserFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Update User" size="md">
      {initial && (
        <UserFormBody
          key={initial.id}
          initial={initial}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Modal>
  );
}

function UserFormBody({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: AppUser;
  onCancel: () => void;
  onSubmit: (values: UserFormValues) => void;
}) {
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initial.role);

  return (
    <>
      <div className="space-y-4">
        {/* Name & username are fixed — only password and role can change. */}
        <Input label="Name" value={initial.name} disabled />
        <Input label="Username" value={initial.username} disabled />
        <Input
          label="Password (leave blank to keep current)"
          placeholder="Leave blank to keep current"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </div>
      <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-ink/10">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onSubmit({ password, role })}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
}
