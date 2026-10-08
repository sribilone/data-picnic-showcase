/** สถานะกำลังโหลด · FRD ข้อ 9.3 */
export default function Loading() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-14 pt-28 md:px-8" aria-busy="true" aria-label="กำลังโหลด">
      <div className="mb-8 h-14 w-2/3 max-w-[560px] animate-pulse rounded-2xl bg-white/10" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-[24px] border-[1.5px] border-[rgba(124,245,196,0.15)] bg-white/5" />
        ))}
      </div>
    </main>
  );
}
