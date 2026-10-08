import Link from "next/link";
import { Logo } from "./Logo";

const NAV = [
  { href: "/admin/rounds", label: "จัดการรอบ" },
  { href: "/admin/works", label: "จัดการผลงาน" },
  { href: "/admin/results", label: "ผลโหวตและส่งออก" },
  { href: "/admin/settings", label: "ตั้งค่า" },
  { href: "/", label: "ดูบอร์ด" },
];

/** เมนูหลังบ้าน · ข้อ 8.1 ของ FRD */
export function AdminSidebar({ email }: { email: string }) {
  return (
    <nav aria-label="เมนูหลังบ้าน" className="flex w-full flex-col gap-1.5 border-b md:max-w-[280px] md:border-b-0 md:border-r border-[rgba(124,245,196,0.18)] bg-[rgba(4,18,12,0.6)] px-5 py-7">
      <Logo small />
      <span className="mb-4 mt-1 text-[13px] text-ice/70">Showcase · ผู้ดูแล</span>
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className="rounded-[14px] px-3.5 py-3 text-ice hover:bg-[rgba(62,224,161,0.12)]">
          {n.label}
        </Link>
      ))}
      <span className="grow" />
      <span className="text-[13px] text-ice/70">{email}</span>
      <form action="/auth/signout" method="post">
        <button className="text-sm text-ice underline">ออกจากระบบ</button>
      </form>
    </nav>
  );
}
