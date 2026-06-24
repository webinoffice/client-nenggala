// src/app/app/(authenticated)/certificate/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import AddCertificateClient from "./AddCertificateClient";

export default function CertificatePage() {
  return (
    <RoleGuard allow={["super-admin", "admin"]}>
      <AddCertificateClient />
    </RoleGuard>
  );
}
