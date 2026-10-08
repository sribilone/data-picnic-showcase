/**
 * ผลโหวตและส่งออก · SCR-044 · FR-046 ถึง FR-049 · BR-007 BR-018
 */
import { ArtFrame } from "@/components/ArtFrame";
import { RoundPicker } from "@/components/admin/RoundPicker";
import { getSession } from "@/lib/session";
import type { AdminResultRow, Round, RoundStats } from "@/lib/types";

export const dynamic = "force-dynamic";

const MEDAL = [
  "bg-[linear-gradient(135deg,#FFE9A8_0%,#FFB02E_100%)] text-ink",
  "bg-[linear-gradient(135deg,#FFFFFF_0%,#B8C7C0_100%)] text-ink",
  "bg-[linear-gradient(135deg,#FFD3A8_0%,#C9783A_100%)] text-ink",
];
const COLS = "grid-cols-[70px_90px_60px_minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_90px]";

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ round?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await getSession();
  const { data: rs } = await supabase.from("rounds").select("*").order("created_at").order("code_prefix");
  const rounds = (rs ?? []) as Round[];
  const round = rounds.find((r) => r.id === sp.round) ?? rounds.find((r) => r.is_shown) ?? rounds.at(-1);
  if (!round) return <h1 className="text-4xl font-bold">ผลโหวตและส่งออก</h1>;

  const [{ data: res }, { data: st }] = await Promise.all([
    supabase.rpc("admin_results", { p_round: round.id }),
    supabase.rpc("admin_round_stats", { p_round: round.id }),
  ]);
  const rows = (res ?? []) as AdminResultRow[];
  const s = ((st ?? [])[0] ?? { works: 0, hidden: 0, voters: 0, hearts: 0 }) as RoundStats;
  const status = round.vote_status === "open" ? "เปิดโหวต" : round.vote_status === "closed" ? "ปิดโหวตแล้ว" : "ยังไม่เปิดโหวต";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-3.5">
        <h1 className="grow text-4xl font-bold">ผลโหวตและส่งออก</h1>
        <RoundPicker rounds={rounds} value={round.id} />
        <a href={`/admin/results/export?round=${round.id}`} className="btn-ghost h-[46px] px-5 text-[15px]">ส่งออก CSV</a>
      </div>

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        <Kpi label="ผลงานในรอบ" value={String(s.works)} />
        <Kpi label="ผู้โหวต" value={String(s.voters)} />
        <Kpi label="หัวใจทั้งหมด" value={String(s.hearts)} />
        <Kpi label="สถานะ" value={status} sub={round.vote_status === "open" && round.vote_close_label ? `ปิดโหวต ${round.vote_close_label}` : undefined} />
      </div>

      <section className="overflow-x-auto rounded-[28px] border-[1.5px] border-[rgba(124,245,196,0.25)] bg-[rgba(4,18,12,0.55)]">
        <div className="flex min-w-[900px] flex-col">
          <div className={`grid ${COLS} items-center gap-3 border-b-[1.5px] border-[rgba(124,245,196,0.22)] bg-[rgba(62,224,161,0.10)] px-5 py-3.5 text-[13px] font-semibold text-ice`}>
            <div>อันดับ</div><div>รหัส</div><div>ภาพ</div><div>เจ้าของผลงาน</div><div>อีเมล</div><div>สไตล์ · โทนสี</div><div className="text-right">หัวใจ</div>
          </div>
          {rows.map((r) => (
            <div key={r.code} className={`grid ${COLS} items-center gap-3 border-b border-[rgba(124,245,196,0.12)] px-5 py-2.5 text-[15px] ${r.rank === 1 ? "bg-[rgba(255,176,46,0.08)]" : ""}`}>
              <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-full font-bold ${r.rank <= 3 ? MEDAL[r.rank - 1] : "bg-[rgba(124,245,196,0.10)] text-ice"}`}>{r.rank}</span>
              <div className="font-bold">#{r.code}</div>
              <div className="w-10"><ArtFrame path={r.image_path} code={r.code} pad={3} /></div>
              <div className="truncate">{r.owner_name}</div>
              <div className="truncate text-white/75">{r.owner_email}</div>
              <div className="truncate text-white/75">{r.style} · {r.tone}</div>
              <div className="text-right text-[17px] font-bold">{r.hearts}</div>
            </div>
          ))}
          <div className="px-5 py-3 text-[13px] text-ice/70">แสดง {rows.length} จาก {s.works} ผลงาน · ไม่รวมผลงานที่ซ่อน</div>
        </div>
      </section>

      <div className="rounded-[22px] border-[1.5px] border-dashed border-[rgba(124,245,196,0.45)] bg-[rgba(124,245,196,0.07)] px-5 py-4 text-[17px] font-bold">
        ไฟล์ส่งออกไม่มีข้อมูลผู้โหวต
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass rounded-[22px] px-5 py-4">
      <div className="text-sm text-ice">{label}</div>
      <div className="text-[38px] font-bold leading-tight">{value}</div>
      {sub && <div className="text-[13px] text-white/65">{sub}</div>}
    </div>
  );
}
