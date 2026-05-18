// src/app/app/(authenticated)/admin/[username]/edit/page.tsx
import AdminFormClient from "../../AdminFormClient";

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <AdminFormClient mode="edit" username={username} />;
}
