export default function SheetHeader() {
  return (
    <div
      className="text-center mb-8 px-5 py-8 bg-surface border border-border relative overflow-hidden"
      style={{ borderTopColor: "var(--accent)", borderTopWidth: "3px" }}
    >
      <div className="absolute -top-[60px] -left-[60px] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(0,212,255,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-[60px] -right-[60px] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(168,85,247,0.12)_0%,transparent_70%)] pointer-events-none" />
      <h1 className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] tracking-[4px] text-accent leading-none [text-shadow:0_0_30px_rgba(0,212,255,0.4)]">
        C++ Cheat Sheet
      </h1>
      <p className="text-muted text-[13px] mt-2 tracking-[3px] uppercase font-light">
        Quick Reference for Professionals
      </p>
      <span className="inline-block mt-3 px-3.5 py-1 border border-accent3 text-accent3 text-[11px] tracking-[2px] uppercase">
        C++17 · ISO Standard
      </span>
    </div>
  );
}