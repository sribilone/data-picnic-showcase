/**
 * ตั้งค่า · SCR-045 · FR-050 ถึง FR-055 · BR-016 BR-017
 */
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { countStudents } from "@/lib/admin";
import { getSession, timeTH } from "@/lib/session";
import type { Round } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase, user } = await getSession();
  const [{ data: admins }, { data: rs }, { data: works }, { data: canPurge }, { data: log }, students] = await Promise.all([
    supabase.from("admins").select("email, name").order("created_at"),
    supabase.from("rounds").select("*").order("created_at").order("code_prefix"),
    supabase.from("works").select("round_id"),
    supabase.rpc("admin_can_purge"),
    supabase.from("audit_log").select("*").order("id", { ascending: false }).limit(50),
    countStudents(),
  ]);
  const roundWorks: Record<string, number> = {};
  for (const w of works ?? []) roundWorks[w.round_id] = (roundWorks[w.round_id] ?? 0) + 1;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-4xl font-bold">ตั้งค่า</h1>
      <SettingsPanel admins={admins ?? []} me={(user?.email ?? "").toLowerCase()} rounds={(rs ?? []) as Round[]}
        roundWorks={roundWorks} students={students} canPurge={!!canPurge} />
      <section className="overflow-hidden rounded-[28px] border-[1.5px] border-[rgba(124,245,196,0.25)] bg-[rgba(4,18,12,0.55)]">
        <div className="px-5 pb-3 pt-5 text-[22px] font-bold">ประวัติการทำรายการ</div>
        <div className="grid grid-cols-[80px_minmax(0,1fr)_minmax(0,1.4fr)] gap-3 bg-[rgba(62,224,161,0.10)] px-5 py-2.5 text-[13px] font-semibold text-ice">
          <div>เวลา</div><div>ผู้ดูแล</div><div>รายการ</div>
        </div>
        {(log ?? []).map((l) => (
          <div key={l.id} className="grid grid-cols-[80px_minmax(0,1fr)_minmax(0,1.4fr)] gap-3 border-b border-[rgba(124,245,196,0.12)] px-5 py-2.5 text-[15px]">
            <div className="text-white/75">{timeTH(l.created_at)}</div>
            <div className="truncate text-white/75">{l.admin_email}</div>
            <div>{l.action} {l.target}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
