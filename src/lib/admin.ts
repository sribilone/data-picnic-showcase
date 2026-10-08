import "server-only";
import { createClient, createServiceClient } from "@/lib/supabase/server";

/** จำนวนบัญชีผู้เรียน ไม่รวมผู้ดูแล ใช้ในหน้าตั้งค่าซึ่งตรวจสิทธิ์ผู้ดูแลแล้ว · SCR-045 */
export async function countStudents(): Promise<number | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) return null;
  const { data: admins } = await supabase.from("admins").select("email");
  const keep = new Set((admins ?? []).map((a) => a.email.toLowerCase()));
  const svc = createServiceClient();
  let n = 0;
  for (let page = 1; ; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return null;
    n += data.users.filter((u) => !keep.has((u.email ?? "").toLowerCase())).length;
    if (data.users.length < 200) break;
  }
  return n;
}
