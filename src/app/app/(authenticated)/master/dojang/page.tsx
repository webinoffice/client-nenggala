// src/app/app/(authenticated)/master/dojang/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import MasterDojangClient from "./MasterDojangClient";

export default function MasterDojangPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <MasterDojangClient />
    </RoleGuard>
  );
}
