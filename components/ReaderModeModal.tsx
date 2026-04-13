"use client";

import { useState, useEffect } from "react";

export default function ReaderModeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("reader-modal-seen")) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem("reader-modal-seen", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <h2 className="font-heading text-[18px] tracking-[3px] uppercase text-foreground">
            Reader Mode
          </h2>
        </div>
        <p className="font-mono text-[12px] text-muted leading-[1.8]">
          Try our new <span className="text-accent">□ reader</span> button at the top right — it narrows the layout so the content is easier to read.
        </p>
        <button
          onClick={dismiss}
          className="mt-1 h-[34px] border border-accent font-mono text-[10px] tracking-[2px] uppercase text-accent hover:bg-accent/10 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
