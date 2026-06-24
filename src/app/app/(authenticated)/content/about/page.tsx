// src/app/app/(authenticated)/content/about/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import AboutClient from "./AboutClient";

export default function ContentAboutPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <AboutClient />
    </RoleGuard>
  );
}
