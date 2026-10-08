/** ไม่มีสิทธิ์เข้าหลังบ้าน · SCR-046 · FR-005 BR-016 */
import Link from "next/link";

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass flex w-full max-w-[560px] flex-col items-center gap-4 px-11 py-12 text-center">
        <h1 className="text-3xl font-bold">บัญชีนี้ไม่มีสิทธิ์เข้าหลังบ้าน</h1>
        <div className="mt-2 flex gap-3">
          <Link href="/" className="btn-cta h-[50px] px-6">ไปที่บอร์ด</Link>
          <Link href="/login" className="btn-ghost h-[50px] px-6">เปลี่ยนบัญชี</Link>
        </div>
      </div>
    </main>
  );
}
