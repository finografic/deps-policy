# @finografic/deps-policy — Handoff

> **How to maintain this file**
> Update after sessions that change architecture, add/remove features, resolve open questions, or shift priorities — not every session.
> — Update only the sections that changed. Keep the total under 150 lines.
> — Write in present tense. No code snippets — describe what exists, not how it works.
> — `.claude/memory.md` = session work log. `.ai/handoff.md` = project state snapshot. Never duplicate between the two.

📅 May 26, 2026

## Project

`@finografic/deps-policy` — canonical dependency and toolchain version policy for the `@finografic` ecosystem. Published to GitHub Packages. Current package version **v0.21.1**. Consumed by `@finografic/genx` and aligned tooling.

## Architecture

The published surface is typed policy data plus `resolvePolicy()` in `src/index.ts` and `src/deps.types.ts`. Package version literals live in `src/policy/*.deps.ts` (base, cli, library, config). Toolchain versions (node, pnpm) live in `src/policy/toolchain.ts` as a separate `ToolchainPolicy` export — not nested in `DependencyPolicy`. All re-exported through `src/policy/index.ts`.

The **policy management CLI** is dev-only under `src/deps-cli/`. It is not part of the published `dist` bundle; maintainers run it via `pnpm policy:outdated`, `pnpm policy:update`, and `pnpm policy:audit` (tsx on `src/deps-cli/cli.ts`). It reads and patches the `*.deps.ts` sources, hits the public npm registry and GitHub Packages for latest versions, and uses the OSV API for audit.

Shared terminal behavior comes from **`@finografic/cli-kit`** (render-help, tui, package-manager). There is no longer a vendored `deps-cli/core` or `deps-cli/tui` tree in this repo.

## Stack

TypeScript strict, ESM. `tsdown` builds three published entry points (`index`, `policy/index`, `deps.types`). Dev workflow adds `@clack/prompts`, `@finografic/cli-kit`, `picocolors`, `tsx`, and related tooling.

## Policy CLI — key facts

Auth for private `@finografic/*` version lookups uses `NPM_TOKEN` from a gitignored `.env` (same PAT idea as GitHub Packages install).

Interactive update uses a multiselect with **no packages pre-selected by default** (explicit opt-in per row). Pinned packages still get per-package follow-up prompts.

All three commands (`outdated`, `update`, `audit`) are wrapped in `withHelp` from `@finografic/cli-kit/render-help` — no manual `--help` guard boilerplate.

## Table / Multiselect Alignment

Table rendering uses `createTable` / `ColumnDef<T>` from `@finografic/cli-kit/tui`. Key constants in `deps-cli/config.constants.ts`:

- `CLACK_LEFT_MARGIN = ' '.repeat(3)` — prefix for static rows (matches clack's visual margin)
- `CLACK_MULTISELECT_PREFIX_WIDTH = 2` — net char difference between clack's checkbox prefix (5 chars) and `CLACK_LEFT_MARGIN` (3 chars); applied as negative padding adjustment on the first column in `selectUpdatePatches` so multiselect rows align with the static table above

Section headers use `renderSectionTitle` from `@finografic/cli-kit/tui`, passing `CLACK_LEFT_MARGIN` as the margin. No local color logic needed.

## Decisions (recent)

1. **cli-kit for deps-cli** — Help rendering, TUI primitives, multiselect line-break, and `pnpm install` spawning use `@finografic/cli-kit`. (2026-04)
2. **Table system** — `createTable` / `ColumnDef<T>` replaced all ad-hoc width computation. Widths computed ANSI-aware from full dataset. (2026-04)
3. **renderSectionTitle** — Section title + divider moved to `cli-kit/tui`; `printGroupTitle` removed from this repo. (2026-04)
4. **`withHelp` wrapper** — All three CLI commands use `withHelp` instead of the manual `if (argv.includes('--help'))` guard. (2026-04)
5. **Policy source filenames** — Policy literals use `*.deps.ts` under `src/policy/`. (ongoing)
6. **Toolchain policy** — Node and pnpm versions stored as bare semver in `src/policy/toolchain.ts` via `ToolchainPolicy` type. Exported as a parallel `toolchain` object alongside `policy`, not nested inside `DependencyPolicy`. Included in the XDG snapshot. Genx consumes these to write `.nvmrc`, `engines.node`, and `packageManager` to target projects — distinct from package dep updates. (2026-05)

## Open questions

1. Whether `genx` should expose a `deps-policy --update` style command that shells into this flow without switching repos — still a future integration; design notes live in `docs/todo/UPDATER_PLAN.md`.
2. 4 commands in `@finografic-genx/src/commands/` still use the old manual `--help` guard — should be updated to `withHelp`.

## Docs

- `README.md` — quick structure and script reference
- `docs/MANUAL.md` — full maintainer reference
- `docs/DEPS_POLICY.md` — policy surface reference
- `docs/todo/UPDATER_PLAN.md` — updater design and UX notes
- `docs/todo/CLI_KIT_PLAN.md` — historical cli-kit planning plus remaining normalization TODOs
- `docs/todo/TODO_TOOLCHAIN_GENX.md` — spec for genx to consume `toolchain` export (node/pnpm writes)

## Agent doc layout

Project rules for assistants live under `.github/instructions/` (see `AGENTS.md` for the index). Session scratchpad for Claude Code remains gitignored under `.claude/` per `CLAUDE.md`. This **`.ai/handoff.md`** file is the git-tracked cross-session snapshot for humans and agents.
