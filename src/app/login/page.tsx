/**
 * เข้าสู่ระบบ · SCR-002 · FR-001 FR-002 FR-003
 */
import { Logo } from "@/components/Logo";
import { LoginButton } from "./LoginButton";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="glass flex w-full max-w-[520px] flex-col items-center gap-5 px-11 py-12 text-center">
        <Logo />
        <h1 className="mt-2 text-4xl font-bold">เข้าสู่ระบบ</h1>
        <p className="text-ice">ใช้บัญชี Google เพื่อโหวตและส่งผลงาน</p>
        <LoginButton next={next ?? "/"} />
        <ul className="w-full border-t border-[rgba(124,245,196,0.18)] pt-4 text-left text-[15px] text-ice">
          <li>บอร์ดไม่แสดงชื่อเจ้าของผลงาน</li>
          <li>ไม่เปิดเผยว่าใครโหวตผลงานใด</li>
        </ul>
      </div>
    </main>
  );
}
