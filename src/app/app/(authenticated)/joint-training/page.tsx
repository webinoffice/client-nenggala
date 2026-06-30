// src/app/app/(authenticated)/joint-training/page.tsx
import RoleGuard from "@/components/app/RoleGuard";
import JointTrainingClient from "./JointTrainingClient";

export default function JointTrainingPage() {
  return (
    <RoleGuard allow={["super-admin"]}>
      <JointTrainingClient />
    </RoleGuard>
  );
}
