/**
 * โครงหลังบ้าน · ตรวจสิทธิ์ผู้ดูแลด้วย is_admin() ทุกหน้า · FR-005 BR-016
 */
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/no-access");

  return (
    <div className="flex min-h-screen">
      <AdminSidebar email={user.email ?? ""} />
      <main className="min-w-0 flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
