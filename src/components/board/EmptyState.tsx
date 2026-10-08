import Link from "next/link";

/** บอร์ดว่าง SCR-005 และไม่มีรอบที่แสดง SCR-006 · FR-011 FR-012 */
export function EmptyState({ title, cta }: { title: string; cta?: { href: string; label: string } }) {
  return (
    <main className="mx-auto max-w-[1280px] px-8 pb-14 pt-6">
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-5 rounded-[36px] border-2 border-dashed border-[rgba(124,245,196,0.45)] bg-[linear-gradient(180deg,rgba(62,224,161,0.12)_0%,rgba(6,22,16,0.70)_100%)] p-12 text-center">
        <svg width="180" height="180" viewBox="0 0 160 160" aria-hidden="true">
          <defs>
            <linearGradient id="es1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#CFFFE3" /></linearGradient>
            <linearGradient id="es2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C4FFE6" /><stop offset="1" stopColor="#3EE0A1" /></linearGradient>
          </defs>
          <ellipse cx="80" cy="136" rx="58" ry="14" fill="#12A07A" />
          <ellipse cx="80" cy="128" rx="58" ry="14" fill="url(#es2)" />
          <rect x="54" y="22" width="56" height="78" rx="10" fill="#12A07A" transform="translate(4 6)" />
          <rect x="54" y="22" width="56" height="78" rx="10" fill="url(#es1)" />
          <path d="M82 46v30M67 61h30" stroke="#12A07A" strokeWidth="7" strokeLinecap="round" />
        </svg>
        <div className="text-[32px] font-bold">{title}</div>
        {cta && <Link href={cta.href} className="btn-cta mt-1 h-14 px-8 text-lg">{cta.label}</Link>}
      </div>
    </main>
  );
}
