/**
 * กรอบภาพผลงาน · BR-019 DEC-008
 * บอร์ดใช้กรอบจัตุรัสเท่ากันทุกใบ ภาพไม่ตัดขอบ ไม่ยืด ไม่หมุน
 */
import { publicImageUrl, thumbPath } from "@/lib/image";

export function ArtFrame({
  path,
  code,
  ratio = "1 / 1",
  thumb = true,
  pad = 12,
}: {
  path: string;
  code: string;
  ratio?: string;
  thumb?: boolean;
  pad?: number;
}) {
  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-[18px] border border-[rgba(124,245,196,0.14)] bg-white/5"
      style={{ aspectRatio: ratio, padding: pad }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={publicImageUrl(thumb ? thumbPath(path) : path)}
        alt={`ผลงาน ${code}`}
        loading="lazy"
        className="max-h-full max-w-full rounded-[10px] object-contain shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
      />
    </div>
  );
}
