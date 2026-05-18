// src/app/app/(authenticated)/master/roles/UserFormModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/roles";
import type { AppUser } from "./MasterRolesClient";

export type UserFormValues = {
  name: string;
  username: string;
  password: string;
  role: Role;
};

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  initial: AppUser | null;
  existingUsernames: string[];
  onSubmit: (values: UserFormValues) => void;
}

export default function UserFormModal({
  open,
  onClose,
  initial,
  existingUsernames,
  onSubmit,
}: UserFormModalProps) {
  const isEditing = initial !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Update User" : "Add User"}
      size="md"
    >
      <UserFormBody
        key={initial?.id ?? "new"}
        initial={initial}
        existingUsernames={existingUsernames}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}

function UserFormBody({
  initial,
  existingUsernames,
  onCancel,
  onSubmit,
}: {
  initial: AppUser | null;
  existingUsernames: string[];
  onCancel: () => void;
  onSubmit: (values: UserFormValues) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">(initial?.role ?? "");
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    password?: string;
    role?: string;
  }>({});

  const isEditing = initial !== null;

  const handleSubmit = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Required";
    if (!username.trim()) next.username = "Required";
    else if (!isEditing && existingUsernames.includes(username.trim()))
      next.username = "Username already exists";
    if (!isEditing && !password.trim()) next.password = "Required";
    if (!role) next.role = "Required";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit({
      name: name.trim(),
      username: username.trim(),
      password,
      role: role as Role,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <Input
          label="Name"
          placeholder="e.g. Fathir"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Username"
          placeholder="e.g. NA0001"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          disabled={isEditing}
        />
        <Input
          label={
            isEditing ? "Password (leave blank to keep current)" : "Password"
          }
          placeholder={
            isEditing ? "Leave blank to keep current" : "Enter password"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role | "")}
          error={errors.role}
        >
          <option value="">Select a role</option>
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
        <Button variant="primary" size="sm" onClick={handleSubmit}>
          {isEditing ? "Save Changes" : "Add User"}
        </Button>
      </div>
    </>
  );
}
