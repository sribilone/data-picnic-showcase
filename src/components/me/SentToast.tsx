"use client";

import { useState } from "react";
import { Toast } from "@/components/Toast";

/** แถบข้อความหลังส่งสำเร็จ · FRD ข้อ 8.2 */
export function SentToast({ code }: { code: string | null }) {
  const [msg, setMsg] = useState(code ? `ส่งผลงานแล้ว รหัส ${code}` : null);
  return <Toast message={msg} onClose={() => setMsg(null)} />;
}
