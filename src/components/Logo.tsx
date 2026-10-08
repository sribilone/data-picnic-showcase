export function Logo({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`inline-block rounded-full bg-white font-logo font-semibold tracking-tight text-[#14231C] ${
        small ? "px-4 py-1.5 text-lg" : "px-5 py-2 text-[22px] shadow-[0_0_28px_rgba(124,245,196,0.4)]"
      }`}
    >
      data<span className="text-[#D4A23A]">.</span>
      <span className="text-[#3E7D5A]">picnic</span>
    </span>
  );
}
