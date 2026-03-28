export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block font-mono text-[10px] tracking-[2px] uppercase text-muted opacity-70 px-3.5 pt-[6px] pb-1">
      {children}
    </span>
  );
}
