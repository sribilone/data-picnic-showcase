"use client";

/** ปุ่มโหวตในหน้าผลงานแบบขยาย · SCR-004 · FR-015 FR-016 FR-017 */
import { Toast } from "@/components/Toast";
import { useVotes } from "@/components/board/useVotes";
import { VoteButton, voteState } from "@/components/board/VoteButton";

export function DetailVote({
  workId, code, isMine, myVotes, heartsPerUser, allowSelf, voteOpen, loggedIn,
}: {
  workId: string; code: string; isMine: boolean; myVotes: string[]; heartsPerUser: number;
  allowSelf: boolean; voteOpen: boolean; loggedIn: boolean;
}) {
  const { voted, left, toggle, message, clearMessage } = useVotes(myVotes, heartsPerUser);
  const state = voteState({ loggedIn, voteOpen, isMine, allowSelf, voted: voted.has(workId), left });
  if (!state) return null;
  return (
    <div className="flex flex-col gap-2">
      <VoteButton big state={state} code={code} hearts={heartsPerUser} onToggle={() => toggle(workId)} />
      {loggedIn && state !== "own" && <div className="text-center text-[15px] text-ice/75">เหลือ {left} หัวใจ</div>}
      <Toast message={message} onClose={clearMessage} tone="error" />
    </div>
  );
}
