// src/app/app/(authenticated)/master/sub-program/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import MasterSubProgramClient from "./MasterSubProgramClient";

export default function MasterSubProgramPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <MasterSubProgramClient />
    </RoleGuard>
  );
}
