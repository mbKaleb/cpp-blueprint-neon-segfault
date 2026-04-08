import React from "react";

type TipColor = "cyan" | "orange" | "purple" | "green" | "red" | "yellow";

const borderClass: Record<TipColor, string> = {
  cyan: "border-accent",
  orange: "border-accent2",
  purple: "border-accent3",
  green: "border-neon",
  red: "border-red-400",
  yellow: "border-yellow-400"
};

interface TipProps {
  color: TipColor;
  children: React.ReactNode;
}

export default function Tip({ color, children }: TipProps) {
  return (
    <div
      className={`px-3.5 py-[9px] text-[12px] text-muted border-l-[3px] bg-white/[.02] [&_strong]:text-foreground ${borderClass[color]}`}
    >
      {children}
    </div>
  );
}
