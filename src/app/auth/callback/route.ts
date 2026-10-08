import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Google ส่งกลับมาที่นี่ แลก code เป็น session แล้วพากลับหน้าเดิม · FR-003 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const safeNext = next.startsWith("/") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}/login?error=1`);
}
