// src/app/app/(authenticated)/master/product/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import MasterProductClient from "./MasterProductClient";

export default function MasterProductPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <MasterProductClient />
    </RoleGuard>
  );
}
