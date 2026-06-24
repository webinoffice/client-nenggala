// src/app/app/(authenticated)/master/grading-belt/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import MasterBeltClient from "./MasterBeltClient";

export default function MasterBeltPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <MasterBeltClient />
    </RoleGuard>
  );
}
