// src/app/app/(authenticated)/master/program/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import MasterProgramClient from "./MasterProgramClient";

export default function MasterProgramPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <MasterProgramClient />
    </RoleGuard>
  );
}
