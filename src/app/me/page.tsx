/**
 * ผลงานของฉัน · SCR-021 · FR-028 ถึง FR-031 FR-056 · BR-006 BR-007 BR-012
 */
import Link from "next/link";
import { ArtFrame } from "@/components/ArtFrame";
import { Heart } from "@/components/Heart";
import { MyWorkCard } from "@/components/me/MyWorkCard";
import { SentToast } from "@/components/me/SentToast";
import { StudentHeader } from "@/components/StudentHeader";
import { getSession } from "@/lib/session";
import type { BoardWork, MyWork, ShownRound } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function MyWorkPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  const { supabase } = await getSession();
  const [{ data: mine }, { data: votes }, { data: rounds }, { data: board }] = await Promise.all([
    supabase.rpc("my_works"), supabase.rpc("my_votes"), supabase.rpc("shown_round"), supabase.rpc("board"),
  ]);
  const works = (mine ?? []) as MyWork[];
  const round = ((rounds ?? []) as ShownRound[])[0];
  const voted = new Set(((votes ?? []) as { work_id: string }[]).map((v) => v.work_id));
  const votedWorks = ((board ?? []) as BoardWork[]).filter((w) => voted.has(w.work_id));
  const hasCurrent = round && works.some((w) => w.round_id === round.id);

  return (
    <>
      <StudentHeader />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-8 pb-14 pt-6">
        <h1 className="text-5xl font-bold">ผลงานของฉัน</h1>

        {works.map((w) => (
          <MyWorkCard key={w.work_id} work={w} uploadLabel={round?.id === w.round_id ? round.upload_close_label : null} />
        ))}

        {round && (
          <section className="flex flex-col gap-3.5">
            <h2 className="text-[26px] font-bold">หัวใจที่ฉันให้ใน{round.name}</h2>
            <div className="flex flex-wrap items-center gap-3">
              {votedWorks.map((w) => (
                <Link key={w.work_id} href={`/works/${w.code}`}
                  className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-[rgba(124,245,196,0.3)] bg-[rgba(4,18,12,0.55)] py-2.5 pl-2.5 pr-4">
                  <div className="w-14"><ArtFrame path={w.image_path} code={w.code} pad={4} /></div>
                  <span className="text-lg font-bold">#{w.code}</span>
                  <Heart size={20} className="text-mint" />
                </Link>
              ))}
              {round.vote_status === "open" && (
                <span className="pl-1.5 text-base text-ice">เหลือ {round.hearts_per_user - votedWorks.length} หัวใจ</span>
              )}
            </div>
          </section>
        )}

        {round && !hasCurrent && (
          <section className="flex flex-wrap items-center gap-4 rounded-[28px] border-[1.5px] border-dashed border-[rgba(124,245,196,0.4)] bg-[rgba(4,18,12,0.55)] px-6 py-5">
            <div className="grow">
              <div className="text-xl font-bold">{round.name}</div>
              <div className="text-[15px] text-white/75">{round.upload_open ? "ยังไม่ได้ส่งผลงาน" : "ยังไม่เปิดรับผลงาน"}</div>
            </div>
            {round.upload_open ? (
              <Link href="/submit" className="btn-cta h-12 px-6">ส่งผลงาน</Link>
            ) : (
              <span className="inline-flex h-12 items-center rounded-full border-[1.5px] border-white/25 px-6 font-semibold text-white/55">ส่งผลงาน</span>
            )}
          </section>
        )}
      </main>
      <SentToast code={sent ?? null} />
    </>
  );
}
