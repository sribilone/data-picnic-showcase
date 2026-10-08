/** กล่องบอกงานที่ยังไม่ได้ทำในหน้าโครง ลบทิ้งเมื่อทำหน้านั้นเสร็จ */
export function Todo({ scr, items }: { scr: string; items: string[] }) {
  return (
    <section className="glass mt-6 p-6">
      <div className="text-sm font-semibold text-glow">{scr} · หน้าโครง</div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-ice">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </section>
  );
}
