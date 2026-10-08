"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { castVote, retractVote } from "@/app/actions";

/** สถานะหัวใจของผู้เรียน อัปเดตทันทีแล้วยืนยันกับฐานข้อมูล · FR-015 FR-016 FR-017 */
export function useVotes(initial: string[], heartsPerUser: number) {
  const [voted, setVoted] = useState<Set<string>>(() => new Set(initial));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const busy = useRef(new Set<string>());

  // ข้อมูลจากเซิร์ฟเวอร์เปลี่ยน เช่น รีเฟรชอัตโนมัติ ให้ใช้ค่าใหม่เมื่อไม่มีคำขอค้าง
  const key = initial.slice().sort().join(",");
  useEffect(() => {
    if (busy.current.size === 0) setVoted(new Set(key ? key.split(",") : []));
  }, [key]);

  const toggle = useCallback(
    (workId: string) => {
      if (busy.current.has(workId)) return; // กันกดซ้ำระหว่างรอผล
      const was = voted.has(workId);
      if (!was && voted.size >= heartsPerUser) {
        setMessage(`ครบ ${heartsPerUser} หัวใจแล้ว ถอนหัวใจจากผลงานอื่นก่อน`);
        return;
      }
      setVoted((cur) => {
        const next = new Set(cur);
        if (was) next.delete(workId);
        else next.add(workId);
        return next;
      });
      busy.current.add(workId);
      startTransition(async () => {
        const res = was ? await retractVote(workId) : await castVote(workId);
        busy.current.delete(workId);
        if (res.error) {
          setVoted((cur) => {
            const back = new Set(cur);
            if (was) back.add(workId);
            else back.delete(workId);
            return back;
          });
          setMessage(res.error);
        }
      });
    },
    [voted, heartsPerUser],
  );

  return { voted, left: heartsPerUser - voted.size, toggle, pending, message, clearMessage: () => setMessage(null) };
}
