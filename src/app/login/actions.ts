"use server";

/**
 * สมัครและเข้าสู่ระบบ · SCR-002 · FR-001
 * สร้างบัญชีด้วยกุญแจผู้ดูแลระบบ ยืนยันอีเมลให้ทันที จึงไม่ขึ้นกับค่า Confirm email ของ project
 * ติดป้าย app_metadata.app = showcase เพื่อแยกจากบัญชีของระบบอื่นใน project เดียวกัน
 */
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { APP_TAG } from "@/lib/supabase/schema";
import { authError } from "@/lib/errors";

type Result = { error?: string };
const EMAIL = /^\S+@\S+\.\S+$/;

export async function signIn(email: string, password: string): Promise<Result> {
  const mail = email.trim().toLowerCase();
  if (!EMAIL.test(mail)) return { error: "อีเมลไม่ถูกต้อง" };
  if (!password) return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
  return error ? { error: authError(error.message) } : {};
}

export async function signUp(name: string, email: string, password: string): Promise<Result> {
  const mail = email.trim().toLowerCase();
  const fullName = name.trim();
  if (!fullName) return { error: "ใส่ชื่อ-นามสกุล" };
  if (fullName.length > 120) return { error: "ชื่อยาวเกินไป" };
  if (!EMAIL.test(mail)) return { error: "อีเมลไม่ถูกต้อง" };
  if (password.length < 6) return { error: "รหัสผ่านอย่างน้อย 6 ตัว" };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { error: "ระบบปิดรับสมัคร แจ้งผู้สอน" };

  const svc = createServiceClient();
  const { error } = await svc.auth.admin.createUser({
    email: mail,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
    app_metadata: { app: APP_TAG },
  });
  if (error) return { error: authError(error.message) };
  return signIn(mail, password);
}
