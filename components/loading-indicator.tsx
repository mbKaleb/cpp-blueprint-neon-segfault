import React, { useEffect, useRef } from "react";

export function LoadingIndicator({ isLoading, onRetry }: { isLoading: boolean; onRetry: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.toggle("translate-y-0", isLoading);
    el.classList.toggle("-translate-y-full", !isLoading);
    if (!isLoading) return;
    const t = setTimeout(onRetry, 1500);
    return () => clearTimeout(t);
  }, [isLoading]);

  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-3 bg-accent text-background text-[11px] tracking-[3px] uppercase -translate-y-full transition-transform duration-300 ease-out"
    >
      <span className="inline-block w-3 h-3 border border-background border-t-transparent rounded-full animate-spin" />
      Retrying...
    </div>
  );
}
