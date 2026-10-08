"use client";

/**
 * การ์ดผลงานของฉัน · SCR-021 · FR-028 FR-029 FR-030 FR-056 · BR-006 BR-007 BR-012
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelWork } from "@/app/actions";
import { ArtFrame } from "@/components/ArtFrame";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Heart } from "@/components/Heart";
import { Toast } from "@/components/Toast";
import type { MyWork } from "@/lib/types";

export function MyWorkCard({ work, uploadLabel }: { work: MyWork; uploadLabel: string | null }) {
  const router = useRouter();
  const [ask, setAsk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const closed = work.vote_status === "closed";
  const status = work.status === "hidden" ? "ซ่อนอยู่" : closed ? "ปิดโหวตแล้ว" : "แสดงอยู่";
  const chip = "rounded-full border-[1.5px] border-[rgba(124,245,196,0.45)] bg-[rgba(124,245,196,0.10)] px-3.5 py-1.5 text-[15px]";

  function confirmCancel() {
    start(async () => {
      const res = await cancelWork(work.work_id);
      setAsk(false);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <section className="glass flex flex-wrap gap-8 rounded-[32px] p-7">
      <div className="w-[300px] max-w-full shrink-0">
        <ArtFrame path={work.image_path} code={work.code} thumb={false} />
      </div>
      <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-3.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-base font-semibold text-glow">{work.round_name}</span>
          <span className={`rounded-full border-[1.5px] px-3 py-1 text-sm font-semibold ${
            work.status === "hidden" ? "border-warn bg-[rgba(255,154,61,0.12)] text-warn-soft"
              : closed ? "border-white/35 bg-white/10" : "border-mint bg-[rgba(62,224,161,0.18)]"}`}>{status}</span>
        </div>
        <div className="text-[56px] font-bold leading-none">#{work.code}</div>
        <div className="flex flex-wrap gap-2.5">
          <span className={chip}>สไตล์ {work.style}</span>
          <span className={chip}>โทนสี {work.tone}</span>
        </div>

        {work.hearts !== null ? (
          <div className="mt-1.5 flex flex-wrap gap-4">
            <div className="rounded-[22px] border-[1.5px] border-[rgba(124,245,196,0.35)] bg-[rgba(4,18,12,0.55)] px-5 py-4">
              <div className="flex items-center gap-2.5 text-[40px] font-bold"><Heart size={32} className="text-mint" />{work.hearts}</div>
              <div className="text-sm text-ice">หัวใจที่ได้รับ</div>
            </div>
            {work.rank !== null && (
              <div className="rounded-[22px] border-[1.5px] border-[rgba(124,245,196,0.35)] bg-[rgba(4,18,12,0.55)] px-5 py-4">
                <div className="text-[40px] font-bold">{work.rank}</div>
                <div className="text-sm text-ice">อันดับจาก {work.total} ผลงาน</div>
              </div>
            )}
          </div>
        ) : work.status === "shown" ? (
          <div className="text-[15px] text-ice/75">จำนวนหัวใจแสดงหลังปิดโหวต</div>
        ) : null}
        {work.hearts !== null && <div className="text-[15px] text-ice/75">ไม่แสดงว่าใครโหวตให้</div>}

        <div className="grow" />
        {work.upload_open && (
          <>
            <div className="flex flex-wrap gap-3">
              <Link href="/submit" className="btn-cta h-12 px-6">แก้ไขผลงาน</Link>
              <button type="button" onClick={() => setAsk(true)} className="btn-danger h-12 px-5">ยกเลิกการส่งผลงาน</button>
            </div>
            <div className="text-sm text-ice/70">แก้ไขหรือยกเลิกการส่งได้จนกว่าปิดรับผลงาน{uploadLabel ? ` ${uploadLabel}` : ""}</div>
          </>
        )}
      </div>
      <ConfirmDialog open={ask} title="ยกเลิกการส่งผลงาน" busy={pending}
        message={`ยกเลิกการส่งผลงาน ${work.code} หัวใจที่ได้รับจะหายไปด้วย`}
        confirmLabel="ยกเลิกการส่งผลงาน" onConfirm={confirmCancel} onCancel={() => setAsk(false)} />
      <Toast message={error} onClose={() => setError(null)} tone="error" />
    </section>
  );
}
