"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?/\\|~";

function rand() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** ms to wait before starting */
  delay?: number;
  /** ms between animation frames */
  fps?: number;
  /** how many random frames before characters start locking */
  holdFrames?: number;
  /** frames between each character locking in */
  stepFrames?: number;
}

export default function ScrambleText({
  text,
  className,
  delay = 0,
  fps = 40,
  holdFrames = 10,
  stepFrames = 3,
}: ScrambleTextProps) {
  // Server renders real text — crawlers and SSR see the title cleanly
  const [display, setDisplay] = useState<string[]>(() => text.split(""));

  useEffect(() => {
    const STORAGE_KEY = `scramble_played:${window.location.pathname}`;

    // Only play once — skip animation if already seen
    if (localStorage.getItem(STORAGE_KEY)) return;

    let intervalId: ReturnType<typeof setInterval>;

    // Scramble immediately on the client before animation starts
    setDisplay(text.split("").map((c) => (c === " " ? " " : rand())));

    const timeoutId = setTimeout(() => {
      let frame = 0;
      const total = holdFrames + text.length * stepFrames;

      intervalId = setInterval(() => {
        frame++;

        setDisplay(
          text.split("").map((char, i) => {
            if (char === " ") return " ";
            const lockAt = holdFrames + i * stepFrames;
            return frame >= lockAt ? char : rand();
          })
        );

        if (frame >= total) {
          clearInterval(intervalId);
          localStorage.setItem(STORAGE_KEY, "1");
        }
      }, fps);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [text, delay, fps, holdFrames, stepFrames]);

  return (
    <span className={className} aria-label={text}>
      {text.split("").map((finalChar, i) =>
        finalChar === " " ? (
          " "
        ) : (
          <span key={i} className="inline-block relative">
            {/* holds the slot width — always the real character */}
            <span className="invisible">{finalChar}</span>
            {/* scrambled character, overlaid and centered */}
            <span className="absolute inset-0 text-center">{display[i]}</span>
          </span>
        )
      )}
    </span>
  );
}
