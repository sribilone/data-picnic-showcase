"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Round } from "@/lib/types";

/** ตัวเลือกรอบในหลังบ้าน เก็บค่าใน query ?round= */
export function RoundPicker({ rounds, value }: { rounds: Round[]; value: string }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  return (
    <select aria-label="รอบ" value={value}
      onChange={(e) => {
        const q = new URLSearchParams(params.toString());
        q.set("round", e.target.value);
        router.push(`${path}?${q.toString()}`);
      }}
      className="h-12 rounded-[14px] border-[1.5px] border-[rgba(124,245,196,0.45)] bg-[#06281D] px-4 text-[15px] text-white">
      {rounds.map((r) => (
        <option key={r.id} value={r.id}>{r.name}{r.period ? ` · ${r.period}` : ""}</option>
      ))}
    </select>
  );
}
