"use client";

/**
 * จัดการรอบ · SCR-041 SCR-042 · FR-032 ถึง FR-040 · BR-002 BR-003 BR-013
 */
import { useState, useTransition } from "react";
import { deleteRound, saveRound, setUpload, setVote, showRound, type ActionResult } from "@/app/admin/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Toast } from "@/components/Toast";
import type { Round, RoundStats, ShowCounts } from "@/lib/types";

export function RoundsManager({ rounds, stats }: { rounds: Round[]; stats: Record<string, RoundStats> }) {
  const [editing, setEditing] = useState<Round | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const shown = rounds.find((r) => r.is_shown);

  function run(fn: () => Promise<ActionResult>) {
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-end gap-4">
        <div className="grow">
          <h1 className="text-4xl font-bold">จัดการรอบ</h1>
          <div className="mt-1.5 text-white/80">บอร์ดแสดงได้ทีละ 1 รอบ</div>
        </div>
        <button type="button" onClick={() => setEditing("new")} className="btn-ghost h-[46px] px-5 text-[15px]">เพิ่มรอบ</button>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-[18px] border-[1.5px] border-dashed border-[rgba(124,245,196,0.45)] bg-[rgba(124,245,196,0.08)] px-4 py-3.5">
        ตอนนี้ผู้เรียนเห็นบนบอร์ด <b className="text-glow">{shown ? shown.name : "ยังไม่มีรอบที่แสดง"}</b>
      </div>

      <div className={`mt-6 flex flex-col gap-5 ${pending ? "opacity-70" : ""}`}>
        {rounds.map((r) => {
          const s = stats[r.id];
          return (
            <section key={r.id}
              className={`flex flex-col gap-4 rounded-[28px] bg-[linear-gradient(180deg,rgba(62,224,161,0.16)_0%,rgba(6,22,16,0.78)_100%)] px-6 py-6 ${
                r.is_shown ? "border-2 border-[rgba(124,245,196,0.85)] shadow-[0_0_50px_rgba(62,224,161,0.3)]" : "border-[1.5px] border-[rgba(124,245,196,0.25)]"}`}>
              <div className="flex flex-wrap items-center gap-3.5">
                <h2 className="text-[26px] font-bold">{r.name}</h2>
                <span className="text-[15px] text-white/75">{r.period} · {r.hearts_per_user} หัวใจ · รหัส {r.code_prefix}</span>
                <span className="grow" />
                <span className="text-[15px] text-ice">{s?.works ?? 0} ผลงาน · {s?.voters ?? 0} คนโหวตแล้ว</span>
                <button type="button" onClick={() => setEditing(r)} className="h-10 rounded-full border-[1.5px] border-[rgba(124,245,196,0.55)] px-4 text-sm font-semibold">แก้ไข</button>
              </div>
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
                <Switch label="รับผลงาน" on={r.upload_open} stateText={r.upload_open ? "เปิดอยู่" : "ปิดอยู่"}
                  onFlip={() => run(() => setUpload(r.id, !r.upload_open))} roundName={r.name} />
                <Switch label="โหวต" on={r.vote_status === "open"}
                  stateText={r.vote_status === "open" ? "เปิดอยู่" : r.vote_status === "closed" ? "ปิดโหวตแล้ว" : "ยังไม่เปิด"}
                  onFlip={() => run(() => setVote(r.id, r.vote_status === "open" ? "closed" : "open"))} roundName={r.name} />
                <Switch label="แสดงบนบอร์ด" on={r.is_shown} stateText={r.is_shown ? "ผู้เรียนเห็นรอบนี้" : "ซ่อนอยู่"}
                  onFlip={() => run(() => showRound(r.id, !r.is_shown))} roundName={r.name} />
              </div>
            </section>
          );
        })}
      </div>

      {editing && (
        <RoundDialog round={editing === "new" ? null : editing} hasWorks={editing !== "new" && (stats[editing.id]?.works ?? 0) > 0}
          nextPrefix={String.fromCharCode(65 + rounds.length)} onClose={() => setEditing(null)} onError={setError} />
      )}
      <Toast message={error} onClose={() => setError(null)} tone="error" />
    </>
  );
}

function Switch({ label, on, stateText, onFlip, roundName }: { label: string; on: boolean; stateText: string; onFlip: () => void; roundName: string }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[18px] border-[1.5px] border-[rgba(124,245,196,0.22)] bg-[rgba(4,18,12,0.55)] px-4 py-3.5">
      <div className="grow">
        <div className="font-semibold">{label}</div>
        <div className="text-[13px] text-white/70">{stateText}</div>
      </div>
      <button type="button" role="switch" aria-checked={on} aria-label={`${label} ${roundName}`} onClick={onFlip}
        className={`flex h-[34px] w-[60px] rounded-full border-[1.5px] p-[3px] ${on ? "justify-end border-ice bg-mint" : "justify-start border-white/30 bg-white/10"}`}>
        <span className={`h-[25px] w-[25px] rounded-full shadow ${on ? "bg-ink" : "bg-ice"}`} />
      </button>
    </div>
  );
}

function RoundDialog({ round, hasWorks, nextPrefix, onClose, onError }: {
  round: Round | null; hasWorks: boolean; nextPrefix: string; onClose: () => void; onError: (m: string) => void;
}) {
  const [f, setF] = useState({
    name: round?.name ?? "", period: round?.period ?? "", prefix: round?.code_prefix ?? nextPrefix,
    hearts: round?.hearts_per_user ?? 3, allowSelf: round?.allow_self_vote ?? false,
    showCounts: (round?.show_counts ?? "after_close") as ShowCounts,
    uploadLabel: round?.upload_close_label ?? "", voteLabel: round?.vote_close_label ?? "",
  });
  const [askDelete, setAskDelete] = useState(false);
  const [pending, start] = useTransition();
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const input = "h-12 w-full rounded-[14px] border-[1.5px] border-[rgba(124,245,196,0.45)] bg-[#06281D] px-4 text-white outline-none";

  function save() {
    start(async () => {
      const res = await saveRound({ id: round?.id ?? null, ...f });
      if (res.error) onError(res.error);
      else onClose();
    });
  }
  function remove() {
    if (!round) return;
    start(async () => {
      const res = await deleteRound(round.id);
      setAskDelete(false);
      if (res.error) onError(res.error);
      else onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(2,6,4,0.78)] p-8" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={round ? `แก้ไข${round.name}` : "เพิ่มรอบ"} onClick={(e) => e.stopPropagation()}
        className="flex max-h-full w-full max-w-[680px] flex-col gap-4 overflow-auto rounded-[32px] border-2 border-[rgba(124,245,196,0.6)] bg-[linear-gradient(180deg,rgba(62,224,161,0.20)_0%,rgba(6,22,16,0.97)_100%)] p-8 shadow-[0_0_80px_rgba(62,224,161,0.3)]">
        <h2 className="text-3xl font-bold">{round ? `แก้ไข${round.name}` : "เพิ่มรอบ"}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <L label="ชื่อรอบ"><input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} /></L>
          <L label="ช่วง"><input className={input} value={f.period} onChange={(e) => set("period", e.target.value)} /></L>
          <L label="ตัวอักษรนำหน้ารหัสผลงาน"><input className={input} maxLength={1} value={f.prefix} disabled={hasWorks} onChange={(e) => set("prefix", e.target.value.toUpperCase())} /></L>
          <L label="หัวใจต่อคน">
            <select className={input} value={f.hearts} onChange={(e) => set("hearts", Number(e.target.value))}>
              <option value={3}>3 หัวใจ</option><option value={1}>1 หัวใจ</option><option value={5}>5 หัวใจ</option>
            </select>
          </L>
          <L label="เวลาปิดรับผลงานที่แสดง"><input className={input} placeholder="เช่น 14:45" value={f.uploadLabel} onChange={(e) => set("uploadLabel", e.target.value)} /></L>
          <L label="เวลาปิดโหวตที่แสดง"><input className={input} placeholder="เช่น 15:30" value={f.voteLabel} onChange={(e) => set("voteLabel", e.target.value)} /></L>
          <L label="โหวตผลงานตัวเอง">
            <select className={input} value={f.allowSelf ? "1" : "0"} onChange={(e) => set("allowSelf", e.target.value === "1")}>
              <option value="0">ไม่อนุญาต</option><option value="1">อนุญาต</option>
            </select>
          </L>
          <L label="แสดงจำนวนหัวใจบนบอร์ด">
            <select className={input} value={f.showCounts} onChange={(e) => set("showCounts", e.target.value as ShowCounts)}>
              <option value="after_close">หลังปิดโหวตเท่านั้น</option><option value="always">แสดงตลอด</option><option value="never">ไม่แสดง</option>
            </select>
          </L>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {round && <button type="button" disabled={hasWorks} onClick={() => setAskDelete(true)} className="btn-danger h-[46px] px-5 text-[15px] disabled:opacity-40">ลบรอบ</button>}
          <span className="grow" />
          <button type="button" onClick={onClose} className="btn-ghost h-[50px] px-6">ยกเลิก</button>
          <button type="button" disabled={pending} onClick={save} className="btn-cta h-[50px] px-8 disabled:opacity-50">บันทึก</button>
        </div>
        {round && <div className="text-sm text-ice/70">ลบได้เฉพาะรอบที่ยังไม่มีผลงาน</div>}
      </div>
      <ConfirmDialog open={askDelete} title="ลบรอบ" message={`ลบ${round?.name ?? ""} ย้อนกลับไม่ได้`} confirmLabel="ลบรอบ"
        busy={pending} onConfirm={remove} onCancel={() => setAskDelete(false)} />
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[15px] font-semibold text-ice">{label}</span>
      {children}
    </label>
  );
}
