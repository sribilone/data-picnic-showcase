"use client";

/**
 * เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน · สมัครครั้งแรกในฟอร์มเดียวกัน · FR-001 FR-002 FR-003
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "./actions";

type Mode = "signin" | "signup";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const input =
    "h-[54px] w-full rounded-2xl border-[1.5px] border-[rgba(124,245,196,0.55)] bg-[#06281D] px-[18px] text-[17px] text-white outline-none placeholder:text-ice/45 focus:border-glow";

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const mail = email.trim().toLowerCase();
    if (mode === "signup" && !name.trim()) return setError("ใส่ชื่อ-นามสกุล");
    if (!/^\S+@\S+\.\S+$/.test(mail)) return setError("อีเมลไม่ถูกต้อง");
    if (password.length < 6) return setError("รหัสผ่านอย่างน้อย 6 ตัว");

    setBusy(true);
    const res = mode === "signup" ? await signUp(name, mail, password) : await signIn(mail, password);
    if (res.error) {
      setBusy(false);
      return setError(res.error);
    }
    router.replace(safeNext);
    router.refresh();
  }

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => switchMode(m)}
      aria-pressed={mode === m}
      className={`h-11 flex-1 rounded-full text-[16px] font-semibold ${mode === m ? "bg-white text-ink" : "text-ice"}`}
    >
      {label}
    </button>
  );

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-3.5 text-left" noValidate>
      <div className="flex gap-1 rounded-full border-[1.5px] border-[rgba(124,245,196,0.35)] p-1">
        {tab("signin", "เข้าสู่ระบบ")}
        {tab("signup", "สมัครครั้งแรก")}
      </div>
      {mode === "signup" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[15px] font-semibold text-ice">ชื่อ-นามสกุล</span>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} />
        </label>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold text-ice">อีเมล</span>
        <input id="email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[15px] font-semibold text-ice">รหัสผ่าน {mode === "signup" && <span className="font-normal text-white/60">อย่างน้อย 6 ตัว</span>}</span>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"} className={input} />
      </label>
      {error && <p role="alert" className="text-[15px] font-semibold text-warn-soft">{error}</p>}
      <button type="submit" disabled={busy} className="btn-cta mt-1 h-[58px] w-full text-lg disabled:opacity-60">
        {busy ? "กำลังดำเนินการ" : mode === "signup" ? "สมัครและเข้าสู่ระบบ" : "เข้าสู่ระบบ"}
      </button>
      {mode === "signin" && <p className="text-center text-sm text-white/60">ลืมรหัสผ่าน แจ้งผู้สอน</p>}
    </form>
  );
}
