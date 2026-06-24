// src/app/app/(authenticated)/content/homepage/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import HomepageClient from "./HomepageClient";

export default function ContentHomepagePage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <HomepageClient />
    </RoleGuard>
  );
}
