/**
 * จัดการรอบ · SCR-041 SCR-042 · FR-032 ถึง FR-040
 */
import { RoundsManager } from "@/components/admin/RoundsManager";
import { getSession } from "@/lib/session";
import type { Round, RoundStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RoundsPage() {
  const { supabase } = await getSession();
  const { data } = await supabase.from("rounds").select("*").order("created_at").order("code_prefix");
  const rounds = (data ?? []) as Round[];
  const stats: Record<string, RoundStats> = {};
  await Promise.all(
    rounds.map(async (r) => {
      const { data: s } = await supabase.rpc("admin_round_stats", { p_round: r.id });
      if (s?.[0]) stats[r.id] = s[0] as RoundStats;
    }),
  );
  return <RoundsManager rounds={rounds} stats={stats} />;
}
