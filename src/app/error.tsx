"use client";

/** สถานะผิดพลาด · FRD ข้อ 9.3 */
import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass flex w-full max-w-[520px] flex-col items-center gap-4 px-10 py-12 text-center">
        <h1 className="text-3xl font-bold">โหลดหน้านี้ไม่สำเร็จ</h1>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-cta h-[50px] px-6">ลองอีกครั้ง</button>
          <Link href="/" className="btn-ghost h-[50px] px-6">กลับไปที่บอร์ด</Link>
        </div>
      </div>
    </main>
  );
}
