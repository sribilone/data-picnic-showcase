"use client";

import { useCallback, useState, useTransition } from "react";
import { castVote, retractVote } from "@/app/actions";

/** สถานะหัวใจของผู้เรียน อัปเดตทันทีแล้วยืนยันกับฐานข้อมูล · FR-015 FR-016 FR-017 */
export function useVotes(initial: string[], heartsPerUser: number) {
  const [voted, setVoted] = useState<Set<string>>(() => new Set(initial));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = useCallback(
    (workId: string) => {
      const was = voted.has(workId);
      if (!was && voted.size >= heartsPerUser) {
        setMessage(`ครบ ${heartsPerUser} หัวใจแล้ว ถอนหัวใจจากผลงานอื่นก่อน`);
        return;
      }
      const next = new Set(voted);
      if (was) next.delete(workId);
      else next.add(workId);
      setVoted(next);
      startTransition(async () => {
        const res = was ? await retractVote(workId) : await castVote(workId);
        if (res.error) {
          setVoted(voted); // คืนค่าเดิม
          setMessage(res.error);
        }
      });
    },
    [voted, heartsPerUser],
  );

  return { voted, left: heartsPerUser - voted.size, toggle, pending, message, clearMessage: () => setMessage(null) };
}
