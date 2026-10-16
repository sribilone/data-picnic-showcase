/**
 * เข้าสู่ระบบ · SCR-002 · FR-001 FR-002 FR-003
 */
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col px-4">
      <div className="mx-auto w-full max-w-[1280px] py-6 md:px-4">
        <Link href="/" className="text-ice">กลับไปที่บอร์ด</Link>
      </div>
      <div className="flex grow items-center justify-center pb-20">
      <div className="glass flex w-full max-w-[520px] flex-col items-center gap-5 px-6 py-10 sm:px-11 sm:py-12 text-center">
        <Logo />
        <h1 className="mt-2 text-4xl font-bold">เข้าสู่ระบบ</h1>
        <p className="text-ice">ครั้งแรกให้กดสมัคร ครั้งต่อไปใช้อีเมลและรหัสผ่านเดิม</p>
        <LoginForm next={next ?? "/"} />
        <ul className="w-full border-t border-[rgba(124,245,196,0.18)] pt-4 text-left text-[15px] text-ice">
          <li>บอร์ดไม่แสดงชื่อเจ้าของผลงาน</li>
          <li>ไม่เปิดเผยว่าใครโหวตผลงานใด</li>
        </ul>
      </div>
      </div>
    </main>
  );
}
