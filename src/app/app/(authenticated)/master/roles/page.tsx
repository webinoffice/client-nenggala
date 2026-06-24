// src/app/app/(authenticated)/master/roles/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import MasterRolesClient from "./MasterRolesClient";

export default function MasterRolesPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <MasterRolesClient />
    </RoleGuard>
  );
}
