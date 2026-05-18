// src/app/app/(authenticated)/student/score/view/[username]/[periodId]/page.tsx
import ScoreViewClient from "./ScoreViewClient";

export default async function ScoreViewPage({
  params,
}: {
  params: Promise<{ username: string; periodId: string }>;
}) {
  const { username, periodId } = await params;
  return <ScoreViewClient username={username} periodId={periodId} />;
}
