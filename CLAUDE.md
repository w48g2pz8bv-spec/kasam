# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev    # Start dev server at http://localhost:3000
npm run build  # Production build
npm run lint   # Run ESLint
npm start      # Start production server
```

## Architecture

**Kasam** is a Turkish-language business management PWA for small local businesses — tracking sales, expenses, and accounts receivable/payable. Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Supabase.

### Key files

- `app/providers.tsx` — **Central state hub.** KasamContext holds all data (`sales`, `expenses`, `accounts`) and all CRUD operations. This is the first file to read when touching data logic.
- `app/utils.ts` — Date/money helpers used everywhere (`getTodayLocalDate`, `formatMoney`, `parseAmount`, `formatDateTR`).
- `app/lib/supabase.ts` — Supabase client; reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BUSINESS_ID`.
- `app/layout.tsx` — Root layout with responsive sidebar (desktop) / bottom nav (mobile).
- `app/desktop/nav.tsx`, `app/mobile/nav.tsx` — Navigation components split by breakpoint.

### Modules (each is a single `"use client"` page)

| Route | Purpose |
|---|---|
| `/` | Dashboard — daily cash position, quick stats, open accounts summary |
| `/sales` | Sales entry and history (Nakit/Kart/Havale) |
| `/expenses` | Expense entry by category (Kira, Personel, Fatura, Malzeme, Reklam, Diğer) |
| `/accounts` | Receivables/payables tracker (Alacak/Borç) |
| `/accountant-package` | Monthly summary for accountant handoff, clipboard export |

### Data sync strategy (providers.tsx)

1. On mount: load localStorage immediately → render UI
2. Background: fetch from Supabase
3. One-time migration: if Supabase empty + local data exists → push to Supabase
4. All writes: optimistic state update first, then async Supabase write
5. localStorage always mirrors state

### Conventions

- **Language**: All UI text is Turkish (tr-TR).
- **Responsive**: Mobile-first; `md:` breakpoint (768px) switches to sidebar layout.
- **Color system**: emerald = revenue/positive, red = expense/debt, amber = payment methods, blue = accounts.
- **Animations**: Framer Motion `AnimatePresence` with staggered list delays (`i * 0.03s`); buttons use `whileTap={{ scale: 0.96 }}`.
- **Decimal input**: Always use `parseAmount()` / `formatMoney()` — never parse user currency strings directly.
- **Date strings**: Store as `YYYY-MM-DD` local strings; use helpers in `utils.ts` for all comparisons and display.
- **No API routes**: All Supabase calls are made directly from client components.
- **No auth**: App uses anon Supabase key; no login flows.
