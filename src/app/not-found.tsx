/** ไม่พบหน้าที่ต้องการ */
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass flex w-full max-w-[520px] flex-col items-center gap-4 px-10 py-12 text-center">
        <h1 className="text-3xl font-bold">ไม่พบหน้านี้</h1>
        <Link href="/" className="btn-cta mt-2 h-[50px] px-6">กลับไปที่บอร์ด</Link>
      </div>
    </main>
  );
}
