"use client";

import { useEffect } from "react";

/** แถบข้อความชั่วคราว · FRD ข้อ 8.2 */
export function Toast({ message, onClose, tone = "info" }: { message: string | null; onClose: () => void; tone?: "info" | "error" }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  return (
    <div role="status" aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border-2 px-6 py-3 text-[15px] font-semibold shadow-[0_0_36px_rgba(62,224,161,0.4)] ${
        tone === "error" ? "border-warn bg-[rgba(40,18,6,0.95)] text-warn-soft" : "border-glow bg-[rgba(6,22,16,0.95)] text-white"
      }`}>
      {message}
    </div>
  );
}
