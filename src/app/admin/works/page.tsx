/**
 * จัดการผลงาน · SCR-043 · FR-041 ถึง FR-045
 * ผู้ดูแลอ่านตาราง works ได้ตรงตาม RLS · BR-001
 */
import Link from "next/link";
import { RoundPicker } from "@/components/admin/RoundPicker";
import { WorksTable } from "@/components/admin/WorksTable";
import { getSession, timeTH } from "@/lib/session";
import type { Round, WorkRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WorksPage({ searchParams }: { searchParams: Promise<{ round?: string; q?: string; status?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await getSession();
  const { data: rs } = await supabase.from("rounds").select("*").order("created_at").order("code_prefix");
  const rounds = (rs ?? []) as Round[];
  const roundId = sp.round ?? rounds.find((r) => r.is_shown)?.id ?? rounds.at(-1)?.id;
  if (!roundId) return <h1 className="text-4xl font-bold">จัดการผลงาน</h1>;

  const { data } = await supabase.from("works").select("*").eq("round_id", roundId).order("code");
  const all = (data ?? []) as WorkRow[];
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = sp.status === "shown" || sp.status === "hidden" ? sp.status : "all";
  const works = all.filter((w) =>
    (status === "all" || w.status === status) &&
    (!q || [w.code, w.owner_name, w.owner_email].some((v) => v.toLowerCase().includes(q))),
  );
  const times = Object.fromEntries(all.map((w) => [w.id, timeTH(w.created_at)]));
  const count = (s: string) => all.filter((w) => w.status === s).length;
  const link = (s: string) => `?${new URLSearchParams({ round: roundId, ...(q ? { q } : {}), status: s }).toString()}`;
  const pill = (on: boolean) => `rounded-full border-[1.5px] px-3.5 py-1.5 ${on ? "border-mint bg-[rgba(62,224,161,0.18)] font-semibold" : "border-[rgba(124,245,196,0.35)] text-ice"}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3.5">
        <h1 className="grow text-4xl font-bold">จัดการผลงาน</h1>
        <RoundPicker rounds={rounds} value={roundId} />
        <form className="contents">
          <input type="hidden" name="round" value={roundId} />
          <input type="search" name="q" defaultValue={sp.q ?? ""} placeholder="ค้นหารหัส ชื่อ หรืออีเมล" aria-label="ค้นหาผลงาน"
            className="h-12 w-[300px] max-w-full rounded-[14px] border-[1.5px] border-[rgba(124,245,196,0.45)] bg-[#06281D] px-4 text-[15px] text-white outline-none placeholder:text-ice/45" />
        </form>
      </div>
      <div className="flex flex-wrap gap-2.5 text-[15px]">
        <Link href={link("all")} className={pill(status === "all")}>ทั้งหมด {all.length}</Link>
        <Link href={link("shown")} className={pill(status === "shown")}>แสดงอยู่ {count("shown")}</Link>
        <Link href={link("hidden")} className={pill(status === "hidden")}>ซ่อนอยู่ {count("hidden")}</Link>
      </div>
      <WorksTable works={works} times={times} total={all.length} />
    </div>
  );
}
