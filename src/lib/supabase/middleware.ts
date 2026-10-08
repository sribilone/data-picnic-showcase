import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** รีเฟรช session ทุกคำขอ และกันหน้า /admin กับหน้าที่ต้องเข้าสู่ระบบ */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response; // ยังไม่ได้ตั้งค่า .env.local

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsLogin = path.startsWith("/me") || path.startsWith("/submit") || path.startsWith("/admin");
  if (!user && needsLogin) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", path); // FR-003 กลับมาหน้าเดิม
    return NextResponse.redirect(login);
  }
  return response;
}
