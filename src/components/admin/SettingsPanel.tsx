"use client";

/**
 * ตั้งค่า · SCR-045 · FR-050 ถึง FR-053 · BR-016 BR-017
 */
import { useState, useTransition } from "react";
import { addAdmin, purgeRoundWorks, purgeStudents, removeAdmin } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Toast } from "@/components/Toast";
import type { Round } from "@/lib/types";

type Admin = { email: string; name: string };

export function SettingsPanel({
  admins, me, rounds, roundWorks, students, canPurge,
}: {
  admins: Admin[]; me: string; rounds: Round[]; roundWorks: Record<string, number>; students: number | null; canPurge: boolean;
}) {
  const [email, setEmail] = useState("");
  const [ask, setAsk] = useState<"students" | "round" | { remove: string } | null>(null);
  const [roundId, setRoundId] = useState(rounds[0]?.id ?? "");
  const [msg, setMsg] = useState<{ text: string; tone: "info" | "error" } | null>(null);
  const [pending, start] = useTransition();
  const input = "h-12 rounded-[14px] border-[1.5px] border-[rgba(124,245,196,0.45)] bg-[#06281D] px-4 text-white outline-none placeholder:text-ice/45";
  const roundName = rounds.find((r) => r.id === roundId)?.name ?? "";

  function run(fn: () => Promise<{ error?: string; deleted?: number }>, ok?: (r: { deleted?: number }) => string) {
    start(async () => {
      const res = await fn();
      setAsk(null);
      if (res.error) setMsg({ text: res.error, tone: "error" });
      else if (ok) setMsg({ text: ok(res), tone: "info" });
    });
  }

  return (
    <>
      <section className="overflow-hidden rounded-[28px] border-[1.5px] border-[rgba(124,245,196,0.25)] bg-[rgba(4,18,12,0.55)]">
        <div className="px-5 pb-3 pt-5 text-[22px] font-bold">ผู้ดูแล</div>
        {admins.map((a) => (
          <div key={a.email} className="flex items-center gap-3 border-b border-[rgba(124,245,196,0.12)] px-5 py-3">
            <div className="min-w-0 grow">
              <div className="font-semibold">{a.name || a.email}</div>
              <div className="truncate text-sm text-white/70">{a.email}</div>
            </div>
            {a.email === me ? <span className="text-sm text-ice">บัญชีนี้</span>
              : <button type="button" onClick={() => setAsk({ remove: a.email })} className="btn-danger h-10 px-4 text-sm">ลบ</button>}
          </div>
        ))}
        <form className="flex flex-wrap gap-3 px-5 py-4"
          onSubmit={(e) => { e.preventDefault(); run(() => addAdmin(email, ""), () => { setEmail(""); return "เพิ่มผู้ดูแลแล้ว"; }); }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมลบัญชี Google" aria-label="อีเมลผู้ดูแลที่จะเพิ่ม" className={`${input} flex-[1_1_280px]`} />
          <button type="submit" disabled={pending || !email} className="btn-ghost h-12 px-5 text-[15px] disabled:opacity-40">เพิ่มผู้ดูแล</button>
        </form>
      </section>

      <section className="flex flex-col gap-3.5 rounded-[28px] border-[1.5px] border-[rgba(255,154,61,0.45)] bg-[rgba(255,154,61,0.06)] px-6 py-5">
        <div className="text-[22px] font-bold">ข้อมูลหลังจบกิจกรรม</div>
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="grow">
            <div className="font-semibold">ลบบัญชีผู้เรียนทั้งหมด</div>
            <div className="text-sm text-white/70">{students === null ? "ยังไม่ได้ตั้งค่า SUPABASE_SERVICE_ROLE_KEY" : `${students} บัญชี`}</div>
          </div>
          <button type="button" disabled={!canPurge || !students} onClick={() => setAsk("students")} className="btn-danger h-11 px-5 text-[15px] disabled:opacity-40">ลบบัญชีผู้เรียน</button>
        </div>
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="grow">
            <div className="font-semibold">ลบผลงานและไฟล์ภาพของรอบ</div>
            <div className="text-sm text-white/70">{roundName} · {roundWorks[roundId] ?? 0} ผลงาน</div>
          </div>
          <select aria-label="รอบที่จะลบ" value={roundId} onChange={(e) => setRoundId(e.target.value)} className={`${input} h-11 text-[15px]`}>
            {rounds.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button type="button" disabled={!canPurge || !roundWorks[roundId]} onClick={() => setAsk("round")} className="btn-danger h-11 px-5 text-[15px] disabled:opacity-40">ลบข้อมูลรอบ</button>
        </div>
        {!canPurge && <div className="text-sm text-warn-soft">ปิดรับผลงานและปิดโหวตทุกรอบก่อน</div>}
      </section>

      <ConfirmDialog open={ask === "students"} title="ลบบัญชีผู้เรียน" requireText="ลบ" busy={pending}
        message={`ลบบัญชีผู้เรียนทั้งหมด ${students ?? 0} บัญชี พิมพ์ ลบ เพื่อยืนยัน`} confirmLabel="ลบบัญชีผู้เรียน"
        onConfirm={() => run(purgeStudents, (r) => `ลบแล้ว ${r.deleted ?? 0} บัญชี`)} onCancel={() => setAsk(null)} />
      <ConfirmDialog open={ask === "round"} title="ลบข้อมูลรอบ" requireText="ลบ" busy={pending}
        message={`ลบผลงานและไฟล์ภาพทั้งหมดของ${roundName} ${roundWorks[roundId] ?? 0} ผลงาน พิมพ์ ลบ เพื่อยืนยัน`} confirmLabel="ลบข้อมูลรอบ"
        onConfirm={() => run(() => purgeRoundWorks(roundId), () => "ลบข้อมูลรอบแล้ว")} onCancel={() => setAsk(null)} />
      <ConfirmDialog open={typeof ask === "object" && ask !== null} title="ลบผู้ดูแล" busy={pending}
        message={`ลบ ${typeof ask === "object" && ask ? ask.remove : ""} ออกจากรายชื่อผู้ดูแล`} confirmLabel="ลบ"
        onConfirm={() => typeof ask === "object" && ask && run(() => removeAdmin(ask.remove))} onCancel={() => setAsk(null)} />
      <Toast message={msg?.text ?? null} tone={msg?.tone} onClose={() => setMsg(null)} />
    </>
  );
}
