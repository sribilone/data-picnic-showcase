import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { BoardWork, ShownRound } from "@/lib/types";

export function displayName(user: User | null) {
  if (!user) return null;
  return (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "";
}

/** ผู้ใช้ปัจจุบันและ client ฝั่งเซิร์ฟเวอร์ */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** ข้อมูลบอร์ดของรอบที่แสดง ใช้ร่วมกันหลายหน้า */
export async function getBoardData() {
  const { supabase, user } = await getSession();
  const [{ data: rounds }, { data: works }, votes] = await Promise.all([
    supabase.rpc("shown_round"),
    supabase.rpc("board"),
    user ? supabase.rpc("my_votes") : Promise.resolve({ data: [] as { work_id: string }[] }),
  ]);
  const round = ((rounds ?? []) as ShownRound[])[0] ?? null;
  return {
    supabase,
    user,
    round,
    works: (works ?? []) as BoardWork[],
    myVotes: ((votes.data ?? []) as { work_id: string }[]).map((v) => v.work_id),
  };
}

/** เวลาแบบ 24 ชั่วโมง เขตเวลาไทย · NFR-13 */
export function timeTH(iso: string) {
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  }).format(new Date(iso));
}
