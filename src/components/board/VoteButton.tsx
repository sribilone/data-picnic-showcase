"use client";

import Link from "next/link";
import { Heart } from "@/components/Heart";

export type VoteButtonState = "own" | "voted" | "open" | "full" | "login";

/** ปุ่มโหวตบนการ์ดและหน้าผลงานแบบขยาย · SCR-003 SCR-004 */
export function VoteButton({
  state, code, onToggle, big = false, hearts,
}: {
  state: VoteButtonState;
  code: string;
  onToggle?: () => void;
  big?: boolean;
  hearts?: number;
}) {
  const h = `whitespace-nowrap ${big ? "h-[58px] px-8 text-[19px] w-full" : "h-11 px-3.5 text-sm"}`;
  if (state === "own")
    return <span className={`inline-flex items-center justify-center rounded-full bg-white font-bold text-ink ${h}`}>ผลงานของคุณ</span>;
  if (state === "login")
    return (
      <Link href={`/login?next=/works/${code}`} aria-label={`โหวต #${code}`} className={`btn-ghost ${h}`}>
        <Heart filled={false} className="text-glow" /> โหวต
      </Link>
    );
  if (state === "voted")
    return (
      <button type="button" onClick={onToggle} aria-pressed="true" aria-label={`ถอนโหวต #${code}`}
        className={`btn-cta ${h} shadow-[0_0_24px_rgba(62,224,161,0.6)]`}>
        <Heart /> โหวตแล้ว
      </button>
    );
  if (state === "full")
    return (
      <button type="button" disabled aria-label="ใช้หัวใจครบแล้ว"
        className={`inline-flex items-center justify-center rounded-full border-[1.5px] border-white/25 font-semibold text-white/60 ${h}`}>
        ครบ {hearts} แล้ว
      </button>
    );
  return (
    <button type="button" onClick={onToggle} aria-pressed="false" aria-label={`โหวต #${code}`} className={`btn-ghost ${h}`}>
      <Heart filled={false} className="text-glow" /> {big ? "โหวตผลงานนี้" : "โหวต"}
    </button>
  );
}

export function voteState(opts: {
  loggedIn: boolean; voteOpen: boolean; isMine: boolean; allowSelf?: boolean; voted: boolean; left: number;
}): VoteButtonState | null {
  if (!opts.voteOpen) return null;
  if (!opts.loggedIn) return "login";
  if (opts.isMine && !opts.allowSelf) return "own";
  if (opts.voted) return "voted";
  return opts.left > 0 ? "open" : "full";
}
