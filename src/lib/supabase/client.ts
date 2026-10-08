import { createBrowserClient } from "@supabase/ssr";

/** ใช้ในคอมโพเนนต์ฝั่งเบราว์เซอร์ */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
