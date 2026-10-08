"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginButton({ next }: { next: string }) {
  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  }
  return (
    <button onClick={signIn} className="h-[58px] w-full rounded-full bg-white text-lg font-bold text-ink">
      เข้าสู่ระบบด้วย Google
    </button>
  );
}
