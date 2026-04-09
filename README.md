# C++ Codex

A dark, neon-styled C++ reference app — 20 topic cards covering everything from basic syntax to C++17 internals, with deep-dive pages for topics that deserve more than a code snippet.

This is a microproject built to explore what Claude Code is capable of as a software engineering collaborator. The entire codebase — component architecture, animations, content, routing, and design system — was built through conversation with Claude, with minimal manual intervention.

## What's in it

- **Cheat sheet** — 20 reference cards covering variables, loops, functions, pointers, OOP, algorithms, and more
- **Deep-dive pages** — extended topic pages with prose content, structured code examples, and detailed tables (e.g. Program Structure covers translation units, ODR, linkage, namespaces, C++17 attributes)
- **ScrambleText** — SSR-safe header animation that reveals the title like a password being cracked, plays once per page via `localStorage`
- **Prose component system** — readable long-form content with `H3`, `P`, `OL`, `LI`, `Code`, `Note`, `Grid`, `Cell`
- **Card sizing** — `sm` / `md` / `lg` responsive grid cards
- **Search bar** — lives in the root layout, filters across all topics

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Google Fonts — Space Grotesk, JetBrains Mono, Bebas Neue

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).