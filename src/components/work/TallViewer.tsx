"use client";

/**
 * กรอบเลื่อนดูภาพแนวตั้งยาว · SCR-004 · FR-058 BR-019
 * รางเลื่อนสีมิ้นต์ขยับตามตำแหน่ง ป้ายเลื่อนลงหายเมื่อถึงล่างสุด ซูมได้ 3 ระดับ
 */
import { useEffect, useRef, useState } from "react";

const ZOOMS = [100, 150, 200];

export function TallViewer({ src, alt }: { src: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0);
  const [thumb, setThumb] = useState({ top: 0, size: 100 });
  const [atEnd, setAtEnd] = useState(false);

  function measure() {
    const el = box.current;
    if (!el) return;
    const size = Math.min(100, (el.clientHeight / el.scrollHeight) * 100);
    const max = el.scrollHeight - el.clientHeight;
    const top = max > 0 ? (el.scrollTop / max) * (100 - size) : 0;
    setThumb({ top, size });
    setAtEnd(max <= 0 || el.scrollTop >= max - 4);
  }

  useEffect(measure, [zoom]);

  return (
    <div className="flex flex-col gap-3">
      <div ref={wrap} className="relative h-[760px] max-h-[75vh] overflow-hidden rounded-[22px] border border-[rgba(124,245,196,0.2)] bg-white/5">
        <div ref={box} onScroll={measure} className="tall-scroll h-full overflow-auto py-3.5 pl-3.5 pr-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} onLoad={measure} style={{ width: `${ZOOMS[zoom]}%`, maxWidth: "none" }}
            className="block rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />
        </div>
        <div aria-hidden="true" className="absolute bottom-[18px] right-[7px] top-[18px] w-1.5 rounded-full bg-[rgba(124,245,196,0.12)]">
          <div className="absolute w-full rounded-full bg-[linear-gradient(180deg,#CFFFE3_0%,#3EE0A1_100%)] shadow-[0_0_12px_rgba(62,224,161,0.6)]"
            style={{ top: `${thumb.top}%`, height: `${thumb.size}%` }} />
        </div>
        {!atEnd && (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[90px] bg-[linear-gradient(180deg,rgba(6,22,16,0)_0%,rgba(6,22,16,0.92)_100%)]" />
            <div className="pointer-events-none absolute bottom-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border-[1.5px] border-[rgba(124,245,196,0.5)] bg-[rgba(4,18,12,0.85)] px-3.5 py-1.5 text-[13px] text-ice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7CF5C4" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
              เลื่อนลง
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" aria-label="ซูมออก" disabled={zoom === 0} onClick={() => setZoom((z) => z - 1)} className="btn-ghost h-11 w-11 text-xl disabled:opacity-40">−</button>
        <button type="button" aria-label="ซูมเข้า" disabled={zoom === ZOOMS.length - 1} onClick={() => setZoom((z) => z + 1)} className="btn-ghost h-11 w-11 text-xl disabled:opacity-40">+</button>
        <button type="button" onClick={() => wrap.current?.requestFullscreen?.()} className="btn-ghost h-11 px-4 text-sm">ดูเต็มจอ</button>
      </div>
    </div>
  );
}
