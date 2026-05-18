// src/app/app/(authenticated)/student/data/[username]/edit/page.tsx
import StudentFormClient from "../../StudentFormClient";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <StudentFormClient mode="edit" username={username} />;
}
