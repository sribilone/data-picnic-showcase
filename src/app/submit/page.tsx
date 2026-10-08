/**
 * ส่งผลงาน · SCR-022 · FR-022 ถึง FR-028 · BR-008 ถึง BR-012
 */
import { EmptyState } from "@/components/board/EmptyState";
import { StudentHeader } from "@/components/StudentHeader";
import { SubmitForm } from "@/components/submit/SubmitForm";
import { displayName, getSession } from "@/lib/session";
import type { MyWork, ShownRound } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const { supabase, user } = await getSession();
  const [{ data: rounds }, { data: mine }] = await Promise.all([supabase.rpc("shown_round"), supabase.rpc("my_works")]);
  const round = ((rounds ?? []) as ShownRound[])[0];
  const existing = round ? ((mine ?? []) as MyWork[]).find((m) => m.round_id === round.id) ?? null : null;

  return (
    <>
      <StudentHeader userName={displayName(user)} />
      {!round || !round.upload_open || !user ? (
        <EmptyState title="ปิดรับผลงานแล้ว" cta={{ href: "/", label: "กลับไปที่บอร์ด" }} />
      ) : (
        <SubmitForm roundId={round.id} roundName={round.name} uploadLabel={round.upload_close_label} userId={user.id}
          existing={existing ? { code: existing.code, style: existing.style, tone: existing.tone, image_path: existing.image_path } : null} />
      )}
    </>
  );
}
