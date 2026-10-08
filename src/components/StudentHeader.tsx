/**
 * ส่วนหัวฝั่งผู้เรียน · SCR-001 SCR-003 SCR-021 · FR-004
 * ดึงผู้ใช้และสิทธิ์ผู้ดูแลเอง ผู้ดูแลเห็นลิงก์หลังบ้านเพิ่ม
 */
import Link from "next/link";
import { displayName, getSession } from "@/lib/session";
import { Logo } from "./Logo";

export async function StudentHeader({ chip }: { chip?: string | null }) {
  const { supabase, user } = await getSession();
  const name = displayName(user);
  const { data: isAdmin } = user ? await supabase.rpc("is_admin") : { data: false };

  return (
    <header className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 px-4 py-6 md:px-8">
      <Link href="/">
        <Logo />
      </Link>
      <span className="text-lg font-semibold text-ice">AI for HR Showcase</span>
      <span className="grow" />
      {chip && (
        <span className="rounded-full border-[1.5px] border-mint bg-[rgba(62,224,161,0.18)] px-3.5 py-1.5 text-[15px] font-semibold">{chip}</span>
      )}
      {name ? (
        <>
          <Link href="/" className="px-3 py-2 text-ice">บอร์ด</Link>
          <Link href="/me" className="px-3 py-2 text-ice">ผลงานของฉัน</Link>
          {isAdmin && <Link href="/admin" className="px-3 py-2 text-ice">หลังบ้าน</Link>}
          <span className="max-w-[220px] truncate rounded-full border border-[rgba(124,245,196,0.35)] bg-[rgba(124,245,196,0.1)] px-4 py-2 text-sm text-ice">
            {name}
          </span>
          <form action="/auth/signout" method="post">
            <button className="px-2 py-2 text-ice underline">ออกจากระบบ</button>
          </form>
        </>
      ) : (
        <Link href="/login" className="rounded-full bg-white px-5 py-3 font-bold text-ink shadow-[0_0_28px_rgba(124,245,196,0.4)]">
          เข้าสู่ระบบด้วย Google
        </Link>
      )}
    </header>
  );
}
