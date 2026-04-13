"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [readerMode, setReaderMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("reader") === "1";
    setReaderMode(saved);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("reader-mode", readerMode);
    document.body.classList.add("reader-transitioning");
    const t = setTimeout(() => document.body.classList.remove("reader-transitioning"), 400);
    localStorage.setItem("reader", readerMode ? "1" : "0");
    return () => clearTimeout(t);
  }, [readerMode]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    onSearch?.(e.target.value);
  }

  return (
    <div className="flex items-center justify-end gap-3 mb-6">
      <span className="font-mono text-[10px] tracking-[2px] uppercase text-muted opacity-40">
        20 topics
      </span>

      {/* <button
        onClick={() => setReaderMode(r => !r)}
        title={readerMode ? "Exit reader mode" : "Reader mode"}
        className={`h-[34px] px-3 border font-mono text-[10px] tracking-[2px] uppercase transition-colors ${
          readerMode
            ? "border-accent text-accent bg-accent/10"
            : "border-border text-muted hover:border-accent hover:text-accent"
        }`}
      >
        {readerMode ? "■ reader" : "□ reader"}
      </button> */}

      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-muted opacity-50 pointer-events-none">
          /
        </span>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="search topics..."
          className="w-full bg-surface border border-border pl-7 pr-3 h-[34px] w-[280px] font-mono text-[11px] tracking-[1px] text-foreground placeholder:text-muted placeholder:opacity-40 focus:outline-none focus:border-accent transition-colors"
        />
      </div>
    </div>
  );
}
