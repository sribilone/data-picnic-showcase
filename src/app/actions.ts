"use server";

/**
 * Server Action ฝั่งผู้เรียน · FR-015 FR-016 FR-029
 * กติกาทั้งหมดอยู่ในฟังก์ชัน SQL ที่นี่ส่งต่อและคืนข้อความผิดพลาด
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { thumbPath } from "@/lib/image";

export type ActionResult = { error?: string };

export async function castVote(workId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cast_vote", { p_work: workId });
  revalidatePath("/", "layout");
  return error ? { error: error.message } : {};
}

export async function retractVote(workId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("retract_vote", { p_work: workId });
  revalidatePath("/", "layout");
  return error ? { error: error.message } : {};
}

/** ยกเลิกการส่งผลงาน แล้วลบไฟล์ภาพหลักและภาพย่อ · BR-012 */
export async function cancelWork(workId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: path, error } = await supabase.rpc("cancel_work", { p_work: workId });
  if (error) return { error: error.message };
  if (typeof path === "string") await supabase.storage.from("works").remove([path, thumbPath(path)]);
  revalidatePath("/", "layout");
  return {};
}
