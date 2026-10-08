/**
 * ผลงานแบบขยาย · SCR-004 · FR-007 FR-009 FR-010 FR-015 ถึง FR-021 FR-057 FR-058 · BR-019
 * แนวตั้ง ภาพซ้าย ข้อมูลขวา · แนวนอน ภาพบน ข้อมูลล่าง · แนวตั้งยาว กรอบเลื่อนและซูม
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart } from "@/components/Heart";
import { DetailVote } from "@/components/work/DetailVote";
import { TallViewer } from "@/components/work/TallViewer";
import { publicImageUrl } from "@/lib/image";
import { getBoardData } from "@/lib/session";
import { orientation, ratioText } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WorkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { user, round, works, myVotes } = await getBoardData();
  const i = works.findIndex((w) => w.code.toLowerCase() === code.toLowerCase());
  if (!round || i < 0) notFound();
  const w = works[i];
  const prev = works[(i - 1 + works.length) % works.length];
  const next = works[(i + 1) % works.length];
  const o = orientation(w.image_w, w.image_h);
  const src = publicImageUrl(w.image_path);

  const chipCls = "rounded-full border-[1.5px] border-[rgba(124,245,196,0.45)] bg-[rgba(124,245,196,0.10)] px-3.5 py-1.5 text-[15px]";
  const info = (
    <>
      <div className="text-base font-semibold text-glow">{round.name} · ผลงานที่ {i + 1} จาก {works.length}</div>
      <h1 className="text-[56px] font-bold leading-none md:text-[64px]">#{w.code}</h1>
      <div className="flex flex-wrap gap-2.5">
        <span className={chipCls}>สไตล์ {w.style}</span>
        <span className={chipCls}>โทนสี {w.tone}</span>
        <span className={chipCls}>{o} {ratioText(w.image_w, w.image_h)}</span>
      </div>
      {w.hearts !== null && (
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Heart size={24} className="text-mint" /> {w.hearts}
          {w.rank !== null && <span className="text-base font-normal text-ice">อันดับ {w.rank}</span>}
        </div>
      )}
    </>
  );
  const actions = (
    <div className="flex flex-col gap-3">
      <DetailVote workId={w.work_id} code={w.code} isMine={w.is_mine} myVotes={myVotes} heartsPerUser={round.hearts_per_user}
        allowSelf={round.allow_self_vote} voteOpen={round.vote_status === "open"} loggedIn={!!user} />
      <div className="flex gap-3">
        <Link href={`/works/${prev.code}`} className="flex h-12 flex-1 items-center justify-center rounded-full border-[1.5px] border-[rgba(124,245,196,0.45)]">ผลงานก่อนหน้า</Link>
        <Link href={`/works/${next.code}`} className="flex h-12 flex-1 items-center justify-center rounded-full border-[1.5px] border-[rgba(124,245,196,0.45)]">ผลงานถัดไป</Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(800px_500px_at_50%_40%,rgba(46,214,160,0.22)_0%,rgba(46,214,160,0)_70%),rgba(2,6,4,0.94)] px-4 py-10 md:px-8">
      <div role="dialog" aria-label={`ผลงาน #${w.code}`}
        className={`relative w-full rounded-[36px] border-2 border-[rgba(124,245,196,0.55)] bg-[linear-gradient(180deg,rgba(62,224,161,0.18)_0%,rgba(6,22,16,0.94)_100%)] p-6 shadow-[0_0_80px_rgba(62,224,161,0.30)] md:p-8 ${
          o === "แนวนอน" ? "max-w-[1160px]" : "max-w-[1080px]"
        }`}>
        <Link href="/" aria-label="ปิด" className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[rgba(124,245,196,0.4)] bg-white/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </Link>

        {o === "แนวนอน" ? (
          <div className="flex flex-col gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`ผลงาน ${w.code}`} className="mx-auto mt-10 max-h-[600px] w-full rounded-[20px] object-contain md:mt-8" />
            <div className="flex flex-wrap items-center gap-5">
              <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-3">{info}</div>
              <div className="flex-[0_1_380px]">{actions}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-9">
            <div className="min-w-0 max-w-[480px] flex-[1_1_420px]">
              {o === "แนวตั้งยาว" ? (
                <TallViewer src={src} alt={`ผลงาน ${w.code}`} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={`ผลงาน ${w.code}`} className="max-h-[80vh] w-full rounded-[24px] object-contain shadow-[0_24px_60px_rgba(0,0,0,0.5)]" />
              )}
            </div>
            <div className="flex min-w-0 flex-[999_1_340px] flex-col gap-5 pt-3">
              {info}
              <div className="grow" />
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
