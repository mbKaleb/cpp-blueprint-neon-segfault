import React from "react";

type DotColor = "cyan" | "orange" | "purple" | "green" | "red" | "yellow";

const dotColorClass: Record<DotColor, string> = {
  cyan: "bg-accent",
  orange: "bg-accent2",
  purple: "bg-accent3",
  green: "bg-neon",
  red: "bg-red-400",
  yellow: "bg-amber-400",
};

const sizeClass: Record<"sm" | "md" | "lg", string> = {
  sm: "",
  md: "col-span-2 max-[740px]:col-span-1",
  lg: "col-span-3 max-[1080px]:col-span-2 max-[740px]:col-span-1",
};

interface CardProps {
  title: string;
  num: string;
  color: DotColor;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function Card({ title, num, color, size = "sm", children }: CardProps) {
  return (
    <div className={`bg-card border border-border overflow-hidden ${sizeClass[size]}`}>
      <div className="flex items-center gap-2.5 px-3.5 py-[11px] border-b border-border bg-white/[.02]">
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColorClass[color]}`} />
        <h2 className="font-heading text-[15px] tracking-[2px] text-foreground">{title}</h2>
        <span className="ml-auto font-mono text-[10px] text-muted opacity-50">{num}</span>
      </div>
      {children}
    </div>
  );
}
