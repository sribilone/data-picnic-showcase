/**
 * บอร์ดผลงาน · SCR-001 SCR-003 SCR-005 SCR-006 SCR-007
 * FR-006 ถึง FR-021 · BR-001 ถึง BR-006 BR-018 BR-019
 */
import { BoardView } from "@/components/board/BoardView";
import { EmptyState } from "@/components/board/EmptyState";
import { ResultsView } from "@/components/board/ResultsView";
import { StudentHeader } from "@/components/StudentHeader";
import { AutoRefresh } from "@/components/board/AutoRefresh";
import { getBoardData } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const { user, round, works, myVotes } = await getBoardData();

  let body: React.ReactNode;
  if (!round) {
    body = <EmptyState title="ยังไม่มีรอบที่แสดง" />;
  } else if (works.length === 0) {
    body = (
      <EmptyState
        title={`${round.name} ยังไม่มีผลงาน`}
        cta={round.upload_open ? { href: user ? "/submit" : "/login?next=/submit", label: `ส่งผลงาน${round.name}` } : undefined}
      />
    );
  } else if (round.vote_status === "closed" && round.counts_visible) {
    body = <ResultsView round={round} works={works} />;
  } else {
    body = <BoardView round={round} works={works} myVotes={myVotes} loggedIn={!!user} />;
  }

  return (
    <>
      <StudentHeader chip={round ? chipText(round.name, round.upload_open, round.vote_status) : null} />
      {body}
      <AutoRefresh seconds={20} />
      <footer className="mx-auto max-w-[1280px] px-8 pb-10 text-sm text-ice/70">
        ไม่แสดงชื่อเจ้าของผลงาน และไม่เปิดเผยว่าใครโหวตผลงานใด
      </footer>
    </>
  );
}

function chipText(name: string, uploadOpen: boolean, vote: string) {
  if (vote === "open") return `${name} · เปิดโหวต`;
  if (vote === "closed") return `${name} · ปิดโหวตแล้ว`;
  if (uploadOpen) return `${name} · เปิดรับผลงาน`;
  return name;
}
