export function Heart({ filled = true, size = 18, className = "" }: { filled?: boolean; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}
      fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth={1.8} strokeLinejoin="round">
      <path d="M12 20s-7.5-4.6-9.4-9.3A5 5 0 0 1 12 6.3a5 5 0 0 1 9.4 4.4C19.5 15.4 12 20 12 20z" />
    </svg>
  );
}
