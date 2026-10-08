import { Heart } from "@/components/Heart";

/** ตัวนับหัวใจที่เหลือ · FR-017 */
export function HeartMeter({ total, used }: { total: number; used: number }) {
  return (
    <div className="flex items-center gap-4 rounded-[24px] border-2 border-[rgba(124,245,196,0.6)] bg-[linear-gradient(180deg,rgba(62,224,161,0.20)_0%,rgba(6,22,16,0.75)_100%)] px-5 py-4 shadow-[0_0_40px_rgba(62,224,161,0.3)]">
      <div className="flex gap-1.5 text-mint">
        {Array.from({ length: total }, (_, i) => (
          <Heart key={i} size={32} filled={i < used} className={i < used ? "text-mint" : "text-glow"} />
        ))}
      </div>
      <div>
        <div className="text-[26px] font-bold">เหลือ {total - used} หัวใจ</div>
        <div className="text-sm text-white/80">ใช้ไปแล้ว {used} จาก {total}</div>
      </div>
    </div>
  );
}
