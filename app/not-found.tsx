import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-muted text-[11px] tracking-[4px] uppercase mb-4">
        Error
      </p>
      <h1 className="font-heading text-[clamp(5rem,20vw,12rem)] leading-none text-accent [text-shadow:0_0_40px_rgba(0,212,255,0.5)]">
        404
      </h1>
      <p className="text-foreground text-lg mt-2 mb-8 tracking-wide">
        Page not found.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 border border-accent text-accent text-[12px] tracking-[3px] uppercase hover:bg-accent hover:text-background transition-colors duration-200"
      >
        Back to Saftey
      </Link>
    </div>
  );
}
