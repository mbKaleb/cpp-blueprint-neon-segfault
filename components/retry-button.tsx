"use client";

interface RetryButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function RetryButton({ onClick, disabled }: RetryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-2.5 border border-accent text-accent text-[12px] tracking-[3px] uppercase hover:bg-accent hover:text-background transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Try Again
    </button>
  );
}
