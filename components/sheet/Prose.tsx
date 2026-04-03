import React from "react";

// ── Prose ──────────────────────────────────────────────────────────────────
// Container — sits inside a Card the same way CodeBlock does

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-4 text-[13.5px] leading-[2] font-sans border-b border-border last:border-b-0 space-y-3">
      {children}
    </div>
  );
}

// ── Grid ───────────────────────────────────────────────────────────────────
// Multi-column layout inside a Card — collapses to 1 col on narrow screens

export function Grid({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  const colClass = cols === 3
    ? "grid-cols-1 sm:grid-cols-3"
    : "grid-cols-1 sm:grid-cols-2";
  return (
    <div className={`grid ${colClass} divide-x divide-border border-b border-border last:border-b-0`}>
      {children}
    </div>
  );
}

// ── Grid cell ──────────────────────────────────────────────────────────────

export function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3.5 py-4 text-[13.5px] leading-[2] font-sans space-y-3 border-b border-border last:border-b-0">
      {children}
    </div>
  );
}

// ── Heading ────────────────────────────────────────────────────────────────

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading text-[17px] tracking-[3px] uppercase text-accent pt-1 first:pt-0">
      {children}
    </h3>
  );
}

// ── Paragraph ─────────────────────────────────────────────────────────────

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground/70">{children}</p>;
}

// ── Ordered list ──────────────────────────────────────────────────────────

export function OL({ children }: { children: React.ReactNode }) {
  return (
    <ol className="space-y-1.5 list-none">
      {React.Children.map(children, (child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<LIProps>, { index: i + 1 })
          : child
      )}
    </ol>
  );
}

// ── Unordered list ────────────────────────────────────────────────────────

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1.5 list-none">{children}</ul>;
}

// ── List item ─────────────────────────────────────────────────────────────

interface LIProps {
  children: React.ReactNode;
  index?: number; // injected by OL
}

export function LI({ children, index }: LIProps) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="shrink-0 inline-flex justify-center font-mono text-[13px] text-accent opacity-70 w-5">
        {index !== undefined ? `${index}.` : "·"}
      </span>
      <span className="text-foreground/70">{children}</span>
    </li>
  );
}

// ── Inline code ───────────────────────────────────────────────────────────

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-[11.5px] text-[#4ec9b0] bg-code-bg px-1.5 py-px">
      {children}
    </code>
  );
}

// ── Muted note ────────────────────────────────────────────────────────────

export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] text-muted opacity-60 border-l-2 border-border pl-3">
      {children}
    </p>
  );
}
