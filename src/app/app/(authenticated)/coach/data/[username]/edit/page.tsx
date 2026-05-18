// src/app/app/(authenticated)/coach/data/[username]/edit/page.tsx
import CoachFormClient from "../../CoachFormClient";
export default async function EditCoachPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <CoachFormClient mode="edit" username={username} />;
}
