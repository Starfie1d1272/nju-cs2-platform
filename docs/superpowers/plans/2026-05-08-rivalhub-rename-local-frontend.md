# RivalHub Rename And Local Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the product from legacy platform brand to RivalHub, keep intentional tournament naming intact, and run the local Next.js frontend so the renamed brand is visible.

**Architecture:** Treat RivalHub as the product/platform brand and centralize public brand strings in one small constant module. Update app chrome, metadata, documentation, tests, and local environment setup, then verify by type-checking, testing, building, and launching the frontend.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, pnpm 11, Vitest, Playwright.

---

## Scope Decisions

Keep these names because current docs and seed data model them as tournament/season brands, not the platform name:

- `NJU Rivals 2026 Spring`
- `NJU Major 2026 Autumn`
- `rivals-2026-spring`
- `major-2026-autumn`
- `CS2` when it refers to the game or roles

Remove these product-brand leftovers:

- `legacy platform brand`
- `legacy platform label` when it is the header/footer/platform label
- `legacy-package-name`
- `legacy-admin-cookie`
- `legacy platform name`

## File Map

- Create: `src/lib/branding.ts` - shared product brand constants.
- Modify: `src/app/layout.tsx` - metadata title template and description.
- Modify: `src/app/page.tsx` - homepage brand display.
- Modify: `src/components/layout/header.tsx` - app chrome brand label.
- Modify: `src/components/layout/footer.tsx` - footer brand and GitHub link.
- Modify: `tests/e2e/flows/home.spec.ts` - homepage brand assertion.
- Modify: `package.json` - package name.
- Modify: `README.md` - public project title, description, and local run notes.
- Modify: `PHASES.md` - roadmap title.
- Modify: `CLAUDE.md` - engineering manual title and overview.
- Modify: `docs/auth-and-permissions.md` - admin cookie example name.
- Modify: `docs/ui-design.md` - wireframe/product text.
- Local only: `.env.local` - ignored development environment values for running the frontend.

## Task 1: Centralize RivalHub Brand Strings And Update Public UI

**Files:**
- Create: `src/lib/branding.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1: Create brand constants**

Create `src/lib/branding.ts`:

```typescript
export const APP_BRAND = {
  name: "RivalHub",
  titleTemplate: "%s | RivalHub",
  description: "RivalHub 是面向 CS2 社群赛事的报名、选秀、队伍与赛程管理平台。",
  footerLabel: "RivalHub · CS2 社群赛事",
  repositoryUrl: "https://github.com/Starfie1d1272/RivalHub",
} as const;
```

- [ ] **Step 2: Update root metadata**

Replace `src/app/layout.tsx` with this content:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_BRAND } from "@/lib/branding";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: APP_BRAND.titleTemplate,
    default: APP_BRAND.name,
  },
  description: APP_BRAND.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update homepage copy**

Replace `src/app/page.tsx` with this content:

```typescript
import { APP_BRAND } from "@/lib/branding";

// Phase 3 will detect the active season and redirect to /[seasonSlug] or show the season list.
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">{APP_BRAND.name}</h1>
      <p className="text-[var(--text-secondary)]">{APP_BRAND.description}</p>
    </div>
  );
}
```

- [ ] **Step 4: Update header brand**

Replace `src/components/layout/header.tsx` with this content:

```typescript
import Link from "next/link";
import { APP_BRAND } from "@/lib/branding";

// Phase 3 will implement multi-season navigation and mobile menu behavior.
export function Header() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-[var(--text-primary)]">
          {APP_BRAND.name}
        </Link>
        {/* Phase 3: season navigation links */}
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Update footer brand and repository link**

Replace `src/components/layout/footer.tsx` with this content:

```typescript
import { APP_BRAND } from "@/lib/branding";

// Phase 3 will expand this footer with season and community information.
export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
        <span>
          {APP_BRAND.footerLabel} · {new Date().getFullYear()}
        </span>
        <a
          href={APP_BRAND.repositoryUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Run TypeScript check for UI changes**

Run:

```bash
pnpm type-check
```

Expected: `tsc --noEmit` completes with exit code `0`.

## Task 2: Rename Package And Documentation Surfaces

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `PHASES.md`
- Modify: `CLAUDE.md`
- Modify: `docs/auth-and-permissions.md`
- Modify: `docs/ui-design.md`

- [ ] **Step 1: Rename the package**

Change `package.json`:

```json
{
  "name": "rivalhub"
}
```

Only change the `name` field; keep scripts, dependencies, `packageManager`, and `engines` unchanged.

- [ ] **Step 2: Update README title and description**

Replace the first four lines of `README.md` with:

```markdown
# RivalHub

> CS2 社群赛事管理平台 — 支持 NJU Rivals & NJU Major
> 报名 · 选秀 · 赛程一体化
```

In the local startup section, keep the existing Phase 1 commands and add this sentence after the `pnpm dev` command block:

```markdown
Phase 1 本地前端验证成功时，`http://localhost:3000` 首页应显示 `RivalHub`。
```

- [ ] **Step 3: Update roadmap title**

Change the first line of `PHASES.md` to:

```markdown
# RivalHub · v1 开发路线图
```

- [ ] **Step 4: Update engineering manual title and overview**

Change the first line of `CLAUDE.md` to:

```markdown
# RivalHub · Claude Code 工程手册
```

Replace the first paragraph under `## 项目概述` with:

```markdown
RivalHub 是面向 CS2 社群赛事的多赛事管理平台，当前支持 NJU Rivals（春季）和 NJU Major（秋季）两个赛事品牌的全流程运营：报名 → 审核 → 队长投票 → 蛇形选秀 → 队伍展示 → 赛程 + Bracket 视图 → 部署。
```

- [ ] **Step 5: Update auth cookie example**

In `docs/auth-and-permissions.md`, replace:

```typescript
cookieName: "legacy-admin-cookie",
```

with:

```typescript
cookieName: "rivalhub-admin",
```

- [ ] **Step 6: Update UI design wireframe brand text**

In `docs/ui-design.md`, replace product-brand occurrences:

```text
legacy platform brand
legacy Chinese platform description
```

with:

```text
RivalHub
CS2 社群赛事管理平台
```

Do not replace `NJU Rivals 2026 Spring` or `NJU Major 2026 Autumn` in this pass.

## Task 3: Update E2E Coverage For The New Brand

**Files:**
- Modify: `tests/e2e/flows/home.spec.ts`

- [ ] **Step 1: Replace the homepage E2E test**

Replace `tests/e2e/flows/home.spec.ts` with this content:

```typescript
import { test, expect } from "@playwright/test";

// Phase 1 E2E smoke test for the public home page.
test("首页返回 200 并包含 RivalHub 品牌", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/RivalHub/);
  await expect(page.getByRole("heading", { name: "RivalHub" })).toBeVisible();
});
```

- [ ] **Step 2: Run the focused E2E test**

Run:

```bash
pnpm test:e2e -- --project=chromium tests/e2e/flows/home.spec.ts
```

Expected: Playwright starts `pnpm dev`, opens Chromium, and the home spec passes.

## Task 4: Configure Local Development And Launch The Frontend

**Files:**
- Local only: `.env.local`

- [ ] **Step 1: Confirm local runtime**

Run:

```bash
node -v
pnpm -v
```

Expected from current machine: Node `v24.14.0` and pnpm `11.0.8`. Node satisfies `.nvmrc`/`package.json` because the project requires Node `>=20.0.0`.

- [ ] **Step 2: Install dependencies**

Run:

```bash
pnpm install
```

Expected: `node_modules/` is created and the lockfile stays compatible with pnpm `11.0.8`.

- [ ] **Step 3: Create local environment file**

Create `.env.local` with these development values:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=local-placeholder
SUPABASE_SERVICE_ROLE_KEY=local-placeholder
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rivalhub_local
ADMIN_SESSION_SECRET=local-rivalhub-development-secret-32chars
ADMIN_INVITE_CODE=local-dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not run `pnpm db:push` or `pnpm seed` for this Phase 1 frontend display check. The current visible pages are static placeholders and do not require a live Supabase project.

- [ ] **Step 4: Check whether port 3000 is free**

Run:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Expected when free: no output.

If the command prints a listening process, use port `3001` for the next step and change `NEXT_PUBLIC_APP_URL` in `.env.local` to `http://localhost:3001`.

- [ ] **Step 5: Start the frontend**

Run this when port `3000` is free:

```bash
pnpm dev
```

Expected: Next.js reports a local URL at `http://localhost:3000`.

Run this when port `3000` is occupied:

```bash
pnpm dev -- -p 3001
```

Expected: Next.js reports a local URL at `http://localhost:3001`.

- [ ] **Step 6: Verify browser-visible output**

Open the active local URL and confirm:

```text
Header brand: RivalHub
Homepage h1: RivalHub
Footer brand: RivalHub · CS2 社群赛事
Document title: RivalHub
```

## Task 5: Final Verification And Search Guard

**Files:**
- No new files.

- [ ] **Step 1: Run static and unit checks**

Run:

```bash
pnpm type-check
pnpm test
pnpm build
```

Expected: all commands exit with code `0`.

- [ ] **Step 2: Run E2E smoke test**

Run:

```bash
pnpm test:e2e -- --project=chromium tests/e2e/flows/home.spec.ts
```

Expected: Chromium and mobile config are not both required for this rename pass; the focused Chromium smoke test passes.

- [ ] **Step 3: Confirm disallowed old brand names are gone**

Run:

```bash
rg -n -i "<legacy product brand patterns>" .
```

Expected: no output.

- [ ] **Step 4: Confirm intentional names remain only where expected**

Run:

```bash
rg -n -i "NJU Rivals|NJU Major|CS2" README.md CLAUDE.md PHASES.md docs src tests
```

Expected: remaining matches refer to tournament brands (`NJU Rivals`, `NJU Major`) or the game (`CS2`), not the old platform name.

- [ ] **Step 5: Report exact local URL and verification result**

Final handoff should include:

```text
Local frontend URL: http://localhost:3000
Verification passed: pnpm type-check, pnpm test, pnpm build, focused Playwright home spec
Old platform-brand search: no disallowed matches
```

If port `3001` was used, report `http://localhost:3001` instead.
