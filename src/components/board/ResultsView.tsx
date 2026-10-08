/**
 * ผลโหวตบนบอร์ดหลังปิดโหวต · SCR-007 · FR-013 BR-006 BR-018
 * ไม่แสดงชื่อเจ้าของ · BR-001
 */
import Link from "next/link";
import { ArtFrame } from "@/components/ArtFrame";
import { Heart } from "@/components/Heart";
import type { BoardWork, ShownRound } from "@/lib/types";

const MEDAL = [
  "bg-[linear-gradient(135deg,#FFE9A8_0%,#FFB02E_100%)]",
  "bg-[linear-gradient(135deg,#FFFFFF_0%,#B8C7C0_100%)]",
  "bg-[linear-gradient(135deg,#FFD3A8_0%,#C9783A_100%)]",
];
const EDGE = ["border-[#FFB02E]", "border-ice", "border-warn"];

export function ResultsView({ round, works }: { round: ShownRound; works: BoardWork[] }) {
  const sorted = [...works].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99) || a.code.localeCompare(b.code));
  const top = sorted.filter((w) => (w.rank ?? 99) <= 3).slice(0, 3);
  const rest = sorted.slice(top.length);
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-8 pb-6 pt-8">
        <h1 className="text-[56px] font-bold leading-tight">
          ผลโหวต <span className="text-glow">{round.name}</span>
        </h1>
      </section>
      <main className="mx-auto flex max-w-[1280px] flex-col gap-7 px-8 pb-14">
        <div className="flex flex-wrap gap-6">
          {top.map((w) => {
            const i = Math.min((w.rank ?? 1) - 1, 2);
            return (
              <Link key={w.work_id} href={`/works/${w.code}`}
                className={`flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-[30px] border-2 ${EDGE[i]} bg-[linear-gradient(180deg,rgba(62,224,161,0.18)_0%,rgba(6,22,16,0.80)_100%)] p-4 shadow-[0_0_50px_rgba(62,224,161,0.25)]`}>
                <ArtFrame path={w.image_path} code={w.code} pad={16} />
                <div className="flex items-center gap-3 px-1">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-full text-[22px] font-bold text-ink ${MEDAL[i]}`}>{w.rank}</span>
                  <span className="grow text-[26px] font-bold">#{w.code}</span>
                  <Heart size={24} className="text-mint" />
                  <span className="text-[28px] font-bold">{w.hearts}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4">
          {rest.map((w) => (
            <Link key={w.work_id} href={`/works/${w.code}`}
              className="flex flex-col gap-2.5 rounded-[20px] border-[1.5px] border-[rgba(124,245,196,0.3)] bg-[linear-gradient(180deg,rgba(62,224,161,0.12)_0%,rgba(6,22,16,0.72)_100%)] p-2.5">
              <ArtFrame path={w.image_path} code={w.code} pad={10} />
              <div className="flex items-center gap-2 px-1">
                <span className="text-sm text-ice">อันดับ {w.rank}</span>
                <span className="grow text-[17px] font-bold">#{w.code}</span>
                <Heart size={16} className="text-mint" />
                <span className="text-[17px] font-bold">{w.hearts}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
