import Link from "next/link";
import { Logo } from "./Logo";

/** ส่วนหัวฝั่งผู้เรียน · SCR-001 SCR-003 SCR-021 */
export function StudentHeader({ userName }: { userName?: string | null }) {
  return (
    <header className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-8 py-6">
      <Link href="/">
        <Logo />
      </Link>
      <span className="text-lg font-semibold text-ice">AI for HR Showcase</span>
      <span className="grow" />
      {userName ? (
        <>
          <Link href="/" className="px-4 py-2 text-ice">บอร์ด</Link>
          <Link href="/me" className="px-4 py-2 text-ice">ผลงานของฉัน</Link>
          <span className="rounded-full border border-[rgba(124,245,196,0.35)] bg-[rgba(124,245,196,0.1)] px-4 py-2 text-sm text-ice">
            {userName}
          </span>
          <form action="/auth/signout" method="post">
            <button className="px-2 py-2 text-ice underline">ออกจากระบบ</button>
          </form>
        </>
      ) : (
        <Link href="/login" className="rounded-full bg-white px-5 py-3 font-bold text-ink">
          เข้าสู่ระบบด้วย Google
        </Link>
      )}
    </header>
  );
}
