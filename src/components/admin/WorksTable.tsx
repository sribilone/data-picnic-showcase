"use client";

/**
 * ตารางจัดการผลงาน · SCR-043 · FR-041 ถึง FR-045 · BR-014 BR-015
 */
import { useState, useTransition } from "react";
import { deleteWork, setWorkHidden } from "@/app/admin/actions";
import { ArtFrame } from "@/components/ArtFrame";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Toast } from "@/components/Toast";
import type { WorkRow } from "@/lib/types";

type Ask = { kind: "hide" | "delete"; work: WorkRow } | null;
const COLS = "grid-cols-[80px_56px_minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,1.5fr)_70px_110px_230px]";

export function WorksTable({ works, times, total }: { works: WorkRow[]; times: Record<string, string>; total: number }) {
  const [ask, setAsk] = useState<Ask>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function act(fn: () => Promise<{ error?: string }>) {
    start(async () => {
      const res = await fn();
      setAsk(null);
      if (res.error) setError(res.error);
    });
  }

  return (
    <section className="overflow-x-auto rounded-[28px] border-[1.5px] border-[rgba(124,245,196,0.25)] bg-[rgba(4,18,12,0.55)]">
      <div className="flex min-w-[960px] flex-col">
        <div className={`grid ${COLS} items-center gap-3 border-b-[1.5px] border-[rgba(124,245,196,0.22)] bg-[rgba(62,224,161,0.10)] px-5 py-3.5 text-[13px] font-semibold text-ice`}>
          <div>รหัส</div><div>ภาพ</div><div>เจ้าของผลงาน</div><div>อีเมล</div><div>สไตล์ · โทนสี</div><div>ส่งเมื่อ</div><div>สถานะ</div><div />
        </div>
        {works.map((w) => {
          const hidden = w.status === "hidden";
          return (
            <div key={w.id} className={`grid ${COLS} items-center gap-3 border-b border-[rgba(124,245,196,0.12)] px-5 py-2 text-[15px]`}>
              <div className="font-bold">#{w.code}</div>
              <div className="w-11"><ArtFrame path={w.image_path} code={w.code} pad={3} /></div>
              <div className="truncate">{w.owner_name}</div>
              <div className="truncate text-white/75">{w.owner_email}</div>
              <div className="truncate text-white/75">{w.style} · {w.tone}</div>
              <div className="text-white/75">{times[w.id]}</div>
              <div>
                <span className={`inline-flex rounded-full border-[1.5px] px-3 py-1 text-[13px] font-semibold ${
                  hidden ? "border-warn bg-[rgba(255,154,61,0.12)] text-warn-soft" : "border-mint bg-[rgba(62,224,161,0.16)]"}`}>
                  {hidden ? "ซ่อนอยู่" : "แสดงอยู่"}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                {hidden ? (
                  <button type="button" disabled={pending} onClick={() => act(() => setWorkHidden(w.id, false))} className="btn-ghost h-10 px-3.5 text-sm">นำกลับขึ้นบอร์ด</button>
                ) : (
                  <button type="button" onClick={() => setAsk({ kind: "hide", work: w })} className="btn-ghost h-10 px-3.5 text-sm">ซ่อน</button>
                )}
                <button type="button" onClick={() => setAsk({ kind: "delete", work: w })} className="btn-danger h-10 px-3.5 text-sm">ลบ</button>
              </div>
            </div>
          );
        })}
        <div className="px-5 py-3 text-[13px] text-ice/70">แสดง {works.length} จาก {total} ผลงาน</div>
      </div>
      <ConfirmDialog open={ask?.kind === "hide"} title="ซ่อนผลงาน" busy={pending}
        message={`ซ่อนผลงาน ${ask?.work.code ?? ""} หัวใจที่ได้รับจะคืนให้ผู้โหวต`} confirmLabel="ซ่อน"
        onConfirm={() => ask && act(() => setWorkHidden(ask.work.id, true))} onCancel={() => setAsk(null)} />
      <ConfirmDialog open={ask?.kind === "delete"} title="ลบผลงาน" busy={pending}
        message={`ลบผลงาน ${ask?.work.code ?? ""} และไฟล์ภาพ ย้อนกลับไม่ได้`} confirmLabel="ลบ"
        onConfirm={() => ask && act(() => deleteWork(ask.work.id))} onCancel={() => setAsk(null)} />
      <Toast message={error} onClose={() => setError(null)} tone="error" />
    </section>
  );
}
