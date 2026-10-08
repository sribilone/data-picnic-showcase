"use client";

import { useState } from "react";

/**
 * กล่องยืนยันก่อนทำรายการที่ย้อนกลับไม่ได้ · FRD ข้อ 8.2
 * requireText ใช้เมื่อต้องพิมพ์คำยืนยัน เช่น ลบ · BR-017
 */
export function ConfirmDialog({
  open, title, message, confirmLabel, requireText, busy, onConfirm, onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  requireText?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  if (!open) return null;
  const ok = !requireText || typed.trim() === requireText;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,4,0.78)] p-6" onClick={onCancel}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[520px] rounded-[28px] border-2 border-[rgba(255,154,61,0.6)] bg-[linear-gradient(180deg,rgba(255,154,61,0.10)_0%,rgba(6,22,16,0.97)_100%)] p-7">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-ice">{message}</p>
        {requireText && (
          <input autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} aria-label={`พิมพ์ ${requireText} เพื่อยืนยัน`}
            placeholder={requireText}
            className="mt-4 h-12 w-full rounded-[14px] border-[1.5px] border-[rgba(255,154,61,0.6)] bg-[#06281D] px-4 text-white outline-none" />
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-ghost h-12 px-6">ยกเลิก</button>
          <button type="button" disabled={!ok || busy} onClick={onConfirm} className="btn-danger h-12 px-6 disabled:opacity-40">
            {busy ? "กำลังทำรายการ" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
