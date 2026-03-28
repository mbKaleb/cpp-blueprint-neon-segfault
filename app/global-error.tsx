"use client";

import { useState } from "react";
import { RetryButton } from "@/components/retry-button";
import { LoadingIndicator } from "@/components/loading-indicator";

export default function GlobalError({
  error: _error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [retrying, setRetrying] = useState(false);

  return (
    <html>
      <body>
        {retrying && <LoadingIndicator onRetry={unstable_retry} />}
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <p className="text-muted text-[11px] tracking-[4px] uppercase mb-4">
            Error
          </p>
          <h1 className="font-heading text-[clamp(5rem,20vw,12rem)] leading-none text-accent [text-shadow:0_0_40px_rgba(0,212,255,0.5)]">
            500
          </h1>
          <p className="text-foreground text-lg mt-2 mb-8 tracking-wide">
            A critical error occurred.
          </p>
          <div className="flex gap-4">
            <RetryButton
              onClick={() => setRetrying(true)}
              disabled={retrying}
            />
            <a
              href="/"
              className="px-6 py-2.5 border border-muted text-muted text-[12px] tracking-[3px] uppercase hover:bg-muted hover:text-background transition-colors duration-200"
            >
              Back to Safety
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
