// src/app/app/(authenticated)/student/score/submit/[username]/[periodId]/page.tsx
import ScoreSubmitClient from "./ScoreSubmitClient";

export default async function ScoreSubmitPage({
  params,
}: {
  params: Promise<{ username: string; periodId: string }>;
}) {
  const { username, periodId } = await params;
  return <ScoreSubmitClient username={username} periodId={periodId} />;
}
