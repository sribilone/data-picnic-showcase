"use client";

/**
 * บอร์ดผลงานระหว่างรับผลงานและเปิดโหวต · SCR-001 SCR-003
 * FR-007 FR-014 FR-015 ถึง FR-019 · BR-003 BR-004 BR-006
 */
import Link from "next/link";
import { ArtFrame } from "@/components/ArtFrame";
import { Heart } from "@/components/Heart";
import { Toast } from "@/components/Toast";
import type { BoardWork, ShownRound } from "@/lib/types";
import { HeartMeter } from "./HeartMeter";
import { useVotes } from "./useVotes";
import { VoteButton, voteState } from "./VoteButton";

export function BoardView({
  round, works, myVotes, loggedIn,
}: {
  round: ShownRound;
  works: BoardWork[];
  myVotes: string[];
  loggedIn: boolean;
}) {
  const { voted, left, toggle, message, clearMessage } = useVotes(myVotes, round.hearts_per_user);
  const voteOpen = round.vote_status === "open";
  const chip = voteOpen ? `${round.name} · เปิดโหวต` : round.upload_open ? `${round.name} · เปิดรับผลงาน` : round.name;

  return (
    <>
      <section className="mx-auto flex max-w-[1280px] flex-wrap items-end gap-6 px-8 pb-6 pt-8">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-2">
          <div className="text-base font-semibold text-glow">
            {chip}
            {voteOpen && round.vote_close_label ? `ถึง ${round.vote_close_label}` : ""}
          </div>
          {loggedIn && voteOpen ? (
            <>
              <h1 className="text-[52px] font-bold leading-tight">
                เลือกผลงานที่ชอบ <span className="text-glow">{round.hearts_per_user} ผลงาน</span>
              </h1>
              <p className="text-lg text-white/80">กดหัวใจอีกครั้งเพื่อถอนโหวต โหวตผลงานของตัวเองไม่ได้</p>
            </>
          ) : (
            <>
              <h1 className="text-[56px] font-bold leading-tight">
                ผลงาน Infographic <span className="text-glow">{round.name}</span>
              </h1>
              {voteOpen && <p className="text-lg text-white/80">เข้าสู่ระบบด้วย Google แล้วกดหัวใจได้ {round.hearts_per_user} ผลงาน</p>}
            </>
          )}
        </div>
        {loggedIn && voteOpen ? (
          <HeartMeter total={round.hearts_per_user} used={round.hearts_per_user - left} />
        ) : (
          <div className="flex flex-wrap gap-3">
            <Stat value={String(works.length)} label="ผลงานในรอบนี้" />
            {voteOpen && round.vote_close_label && <Stat value={round.vote_close_label} label="ปิดโหวต" />}
          </div>
        )}
        {loggedIn && round.upload_open && (
          <Link href="/submit" className="btn-cta h-12 px-6">ส่งผลงาน</Link>
        )}
      </section>

      <main className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5 px-8 pb-14">
        {works.map((w) => {
          const isVoted = voted.has(w.work_id);
          const state = voteState({ loggedIn, voteOpen, isMine: w.is_mine, allowSelf: round.allow_self_vote, voted: isVoted, left });
          return (
            <article key={w.work_id}
              className={`flex flex-col gap-3 rounded-[24px] bg-[linear-gradient(180deg,rgba(62,224,161,0.14)_0%,rgba(6,22,16,0.72)_100%)] p-3 ${
                isVoted ? "border-2 border-mint shadow-[0_0_44px_rgba(62,224,161,0.45)]" : "border-[1.5px] border-[rgba(124,245,196,0.32)]"
              }`}>
              <Link href={`/works/${w.code}`} aria-label={`ดูผลงาน ${w.code}`}>
                <ArtFrame path={w.image_path} code={w.code} />
              </Link>
              <div className="flex items-center gap-2 px-1">
                <div className="min-w-0 grow">
                  <div className="text-lg font-bold">#{w.code}</div>
                  <div className="truncate text-[13px] text-white/70">{w.style}</div>
                </div>
                {w.hearts !== null && (
                  <span className="flex items-center gap-1 font-bold"><Heart size={16} className="text-mint" />{w.hearts}</span>
                )}
                {state && <VoteButton state={state} code={w.code} hearts={round.hearts_per_user} onToggle={() => toggle(w.work_id)} />}
              </div>
            </article>
          );
        })}
      </main>
      <Toast message={message} onClose={clearMessage} tone="error" />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="glass rounded-[20px] px-5 py-3.5">
      <div className="text-[32px] font-bold text-glow">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
  );
}
