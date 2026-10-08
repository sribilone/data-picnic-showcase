"use server";

/**
 * Server Action หลังบ้าน · FR-032 ถึง FR-055
 * ทุกฟังก์ชัน SQL ตรวจสิทธิ์ผู้ดูแลเองอีกชั้น · BR-016
 */
import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { thumbPath } from "@/lib/image";
import type { ShowCounts, VoteStatus } from "@/lib/types";

export type ActionResult = { error?: string };

async function call(fn: string, args: Record<string, unknown>): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc(fn, args);
  revalidatePath("/", "layout");
  return error ? { error: error.message } : {};
}

async function removeFiles(paths: string[]) {
  if (!paths.length) return;
  const supabase = await createClient();
  const all = paths.flatMap((p) => [p, thumbPath(p)]);
  for (let i = 0; i < all.length; i += 100) await supabase.storage.from("works").remove(all.slice(i, i + 100));
}

// ---------- รอบ ----------
export async function saveRound(input: {
  id: string | null; name: string; period: string; prefix: string; hearts: number;
  allowSelf: boolean; showCounts: ShowCounts; uploadLabel: string; voteLabel: string;
}) {
  if (!input.name.trim()) return { error: "ใส่ชื่อรอบ" };
  if (!/^[A-Za-z]$/.test(input.prefix)) return { error: "ตัวอักษรนำหน้ารหัสต้องเป็นอักษรอังกฤษ 1 ตัว" };
  return call("admin_save_round", {
    p_id: input.id, p_name: input.name.trim(), p_period: input.period.trim(), p_prefix: input.prefix.toUpperCase(),
    p_hearts: input.hearts, p_allow_self: input.allowSelf, p_show_counts: input.showCounts,
    p_upload_label: input.uploadLabel.trim() || null, p_vote_label: input.voteLabel.trim() || null,
  });
}
export const showRound = async (id: string, on: boolean) => call("admin_show_round", { p_round: id, p_on: on });
export const setUpload = async (id: string, open: boolean) => call("admin_set_upload", { p_round: id, p_open: open });
export const setVote = async (id: string, status: VoteStatus) => call("admin_set_vote", { p_round: id, p_status: status });
export const deleteRound = async (id: string) => call("admin_delete_round", { p_round: id });

// ---------- ผลงาน ----------
export const setWorkHidden = async (id: string, hidden: boolean) => call("admin_set_work_hidden", { p_work: id, p_hidden: hidden });

export async function deleteWork(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: path, error } = await supabase.rpc("admin_delete_work", { p_work: id });
  if (error) return { error: error.message };
  if (typeof path === "string") await removeFiles([path]);
  revalidatePath("/", "layout");
  return {};
}

// ---------- ผู้ดูแล ----------
export const addAdmin = async (email: string, name: string) =>
  /^\S+@\S+\.\S+$/.test(email.trim()) ? call("admin_add_admin", { p_email: email, p_name: name }) : { error: "อีเมลไม่ถูกต้อง" };
export const removeAdmin = async (email: string) => call("admin_remove_admin", { p_email: email });

// ---------- ลบข้อมูลหลังจบกิจกรรม · BR-017 ----------
export async function purgeRoundWorks(roundId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_purge_round_works", { p_round: roundId });
  if (error) return { error: error.message };
  await removeFiles((data ?? []) as string[]);
  revalidatePath("/", "layout");
  return {};
}

/** ลบบัญชีผู้เรียนทั้งหมด ยกเว้นผู้ดูแล ใช้ service role ฝั่งเซิร์ฟเวอร์ · FR-052 */
export async function purgeStudents(): Promise<ActionResult & { deleted?: number }> {
  const supabase = await createClient();
  const { data: canPurge, error } = await supabase.rpc("admin_can_purge");
  if (error) return { error: error.message };
  if (!canPurge) return { error: "ปิดรับผลงานและปิดโหวตทุกรอบก่อน" };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: "ยังไม่ได้ตั้งค่า SUPABASE_SERVICE_ROLE_KEY" };

  const { data: admins } = await supabase.from("admins").select("email");
  const keep = new Set((admins ?? []).map((a) => a.email.toLowerCase()));
  const svc = createServiceClient();
  let deleted = 0;
  for (let page = 1; ; page++) {
    const { data, error: listError } = await svc.auth.admin.listUsers({ page, perPage: 200 });
    if (listError) return { error: listError.message };
    const users = data.users.filter((u) => !keep.has((u.email ?? "").toLowerCase()));
    for (const u of users) {
      const { error: delError } = await svc.auth.admin.deleteUser(u.id);
      if (!delError) deleted++;
    }
    if (data.users.length < 200) break;
  }
  await svc.from("audit_log").insert({ admin_email: (await supabase.auth.getUser()).data.user?.email ?? "", action: "ลบบัญชีผู้เรียน", target: `${deleted} บัญชี` });
  revalidatePath("/admin/settings");
  return { deleted };
}
