// src/app/app/(authenticated)/master/ebook/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import MasterEbookClient from "./MasterEbookClient";

export default function MasterEbookPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <MasterEbookClient />
    </RoleGuard>
  );
}
