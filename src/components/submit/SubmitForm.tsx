"use client";

/**
 * ส่งหรือแก้ไขผลงาน · SCR-022 · FR-022 ถึง FR-028 · BR-008 ถึง BR-012
 * ย่อภาพ → อัปโหลดภาพหลักและภาพย่อ → submit_work() → ลบไฟล์เดิมเมื่อแก้ไข
 */
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";
import { checkFile, prepareImages, publicImageUrl, thumbPath, type Resized } from "@/lib/image";

const STYLE_HINTS = ["การ์ตูนลายเส้น", "มินิมอล", "ไอโซเมตริก", "ป๊อปอาร์ต", "สีน้ำ"];
const TONE_HINTS = ["ส้มครีม", "เขียวพาสเทล", "ฟ้าน้ำทะเล", "เหลืองสดใส", "กรมท่า"];

type Existing = { code: string; style: string; tone: string; image_path: string } | null;

export function SubmitForm({
  roundId, roundName, uploadLabel, userId, existing,
}: {
  roundId: string; roundName: string; uploadLabel: string | null; userId: string; existing: Existing;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(existing ? publicImageUrl(existing.image_path) : null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [style, setStyle] = useState(existing?.style ?? "");
  const [tone, setTone] = useState(existing?.tone ?? "");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { if (file && preview?.startsWith("blob:")) URL.revokeObjectURL(preview); }, [file, preview]);

  function pick(f: File | undefined) {
    if (!f) return;
    const err = checkFile(f);
    setFileError(err);
    if (err) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  const ready = (file || existing) && style.trim() && tone.trim() && consent && !busy;

  async function submit() {
    if (!ready) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    let newPath: string | null = null;
    try {
      let w = 0, h = 0;
      let path = existing?.image_path ?? "";
      if (file) {
        const { main, thumb } = await prepareImages(file);
        path = `${roundId}/${userId}/${Date.now()}.jpg`;
        await upload(supabase, path, main);
        newPath = path;
        await upload(supabase, thumbPath(path), thumb);
        w = main.width; h = main.height;
      }
      if (!file && existing) {
        // แก้แค่สไตล์หรือโทนสี ใช้ขนาดภาพเดิมจาก my_works
        const { data } = await supabase.rpc("my_works");
        const mine = (data ?? []).find((m: { round_id: string }) => m.round_id === roundId);
        w = mine?.image_w ?? 1; h = mine?.image_h ?? 1;
      }
      const { data: code, error: rpcError } = await supabase.rpc("submit_work", {
        p_round: roundId, p_image_path: path, p_w: w, p_h: h,
        p_style: style.trim(), p_tone: tone.trim(), p_consent: consent,
      });
      if (rpcError) throw new Error(friendlyError(rpcError.message));
      if (file && existing) {
        await supabase.storage.from("works").remove([existing.image_path, thumbPath(existing.image_path)]);
      }
      router.push(`/me?sent=${encodeURIComponent(String(code))}`);
      router.refresh();
    } catch (e) {
      if (newPath) await supabase.storage.from("works").remove([newPath, thumbPath(newPath)]);
      const msg = e instanceof Error ? friendlyError(e.message) : "";
      setError(!msg || msg.startsWith("เชื่อมต่อไม่ได้") || msg.startsWith("ทำรายการไม่สำเร็จ") ? "ส่งไม่สำเร็จ ลองอีกครั้ง" : msg);
      setBusy(false);
    }
  }

  const fieldCls = "h-[54px] rounded-2xl border-[1.5px] border-[rgba(124,245,196,0.55)] bg-[#06281D] px-4 text-[17px] text-white outline-none placeholder:text-ice/45";

  return (
    <main className="mx-auto flex max-w-[1280px] flex-wrap items-start gap-8 px-8 pb-14 pt-4">
      <section className="flex min-w-0 max-w-[520px] flex-[1_1_420px] flex-col gap-3.5">
        <button type="button" onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files[0]); }}
          className="flex aspect-square items-center justify-center overflow-hidden rounded-[32px] border-2 border-dashed border-[rgba(124,245,196,0.6)] bg-[linear-gradient(180deg,rgba(62,224,161,0.16)_0%,rgba(6,22,16,0.72)_100%)] p-4">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="ภาพผลงานที่เลือก" className="max-h-full max-w-full rounded-[18px] object-contain shadow-[0_20px_50px_rgba(0,0,0,0.45)]" />
          ) : (
            <span className="text-lg font-semibold text-ice">เลือกรูปผลงาน</span>
          )}
        </button>
        <input ref={input} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <div className="flex items-center gap-3.5">
          <div className="min-w-0 grow">
            <div className="truncate text-base font-semibold">{file ? file.name : existing ? `ภาพเดิมของ #${existing.code}` : "ยังไม่ได้เลือกรูป"}</div>
            {file && <div className="text-sm text-white/70">{(file.size / 1024 / 1024).toFixed(1)} MB · {file.type === "image/png" ? "PNG" : "JPG"}</div>}
          </div>
          <button type="button" onClick={() => input.current?.click()} className="btn-ghost h-11 px-4 text-[15px]">{preview ? "เลือกรูปใหม่" : "เลือกรูป"}</button>
        </div>
        {fileError && <div className="text-[15px] font-semibold text-warn-soft">{fileError}</div>}
      </section>

      <section className="flex min-w-0 flex-[999_1_420px] flex-col gap-5">
        <div>
          <div className="text-base font-semibold text-glow">{roundName}{uploadLabel ? ` · รับผลงานถึง ${uploadLabel}` : ""}</div>
          <h1 className="text-5xl font-bold leading-tight">{existing ? `แก้ไขผลงาน #${existing.code}` : "ส่งผลงานของฉัน"}</h1>
        </div>
        <div className="rounded-[18px] border-[1.5px] border-[rgba(124,245,196,0.3)] bg-[rgba(124,245,196,0.08)] px-4 py-3.5 text-[15px] text-ice">
          ชื่อในบัญชี Google เห็นเฉพาะผู้สอน บนบอร์ดแสดงเป็นรหัสผลงานเท่านั้น
        </div>

        <Field id="style" label="สไตล์ที่ใช้" value={style} onChange={setStyle} hints={STYLE_HINTS} placeholder="เช่น การ์ตูนลายเส้น" cls={fieldCls} />
        <Field id="tone" label="โทนสีที่ใช้" value={tone} onChange={setTone} hints={TONE_HINTS} placeholder="เช่น ส้มครีม" cls={fieldCls} />

        <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border-[1.5px] border-[rgba(255,154,61,0.6)] bg-[rgba(255,154,61,0.10)] px-4 py-3.5 text-[15px]">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-[22px] w-[22px] shrink-0 accent-mint" />
          ผลงานนี้ไม่มีข้อมูลส่วนบุคคลของผู้อื่น
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <button type="button" disabled={!ready} onClick={submit} className="btn-cta h-[58px] px-10 text-[19px] disabled:opacity-40">
            {busy ? "กำลังส่ง" : existing ? "บันทึกการแก้ไข" : "ส่งผลงาน"}
          </button>
          <div className="text-sm text-ice/75">PNG หรือ JPG ไม่เกิน 10 MB · ส่งได้ 1 ผลงานต่อรอบ</div>
        </div>
        {error && (
          <div className="flex items-center gap-3 text-[15px] font-semibold text-warn-soft">
            {error}
            {error === "ส่งไม่สำเร็จ ลองอีกครั้ง" && <button type="button" onClick={submit} className="btn-danger h-10 px-4 text-sm">ลองอีกครั้ง</button>}
          </div>
        )}
      </section>
    </main>
  );
}

async function upload(supabase: ReturnType<typeof createClient>, path: string, img: Resized) {
  // ลองใหม่อัตโนมัติ 2 ครั้ง เผื่อเน็ตห้องเรียนสะดุด
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error } = await supabase.storage.from("works").upload(path, img.blob, { contentType: "image/jpeg", upsert: false });
    if (!error) return;
    if (attempt === 2) throw new Error("ส่งไม่สำเร็จ ลองอีกครั้ง");
    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
  }
}

function Field({ id, label, value, onChange, hints, placeholder, cls }: {
  id: string; label: string; value: string; onChange: (v: string) => void; hints: string[]; placeholder: string; cls: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={id} className="text-base font-semibold text-ice">
        {label} <span className="font-normal text-white/60">พิมพ์เองได้</span>
      </label>
      <input id={id} value={value} maxLength={120} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      <div className="flex flex-wrap gap-2">
        {hints.map((h) => (
          <button key={h} type="button" onClick={() => onChange(h)}
            className={`h-9 rounded-full border-[1.5px] px-3.5 text-sm ${value === h ? "border-ice bg-mint text-ink" : "border-[rgba(124,245,196,0.35)] bg-[rgba(124,245,196,0.06)] text-ice"}`}>
            {h}
          </button>
        ))}
      </div>
    </div>
  );
}
