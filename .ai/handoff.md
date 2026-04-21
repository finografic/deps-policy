# @finografic/deps-policy — Handoff

> **How to maintain this file**
> Update after sessions that change architecture, add/remove features, resolve open questions, or shift priorities — not every session.
> — Update only the sections that changed. Keep the total under 150 lines.
> — Write in present tense. No code snippets — describe what exists, not how it works.
> — `.claude/memory.md` = session work log. `.ai/handoff.md` = project state snapshot. Never duplicate between the two.

📅 Apr 10, 2026

## Project

`@finografic/deps-policy` — Canonical dependency version policy for the `@finografic` ecosystem.
Current version **v0.4.0**, published to GitHub Packages. Consumed by `@finografic/genx`.

## Architecture

Single-purpose data package. No runtime logic beyond one merge utility.

```
src/
  types.ts          # DependencyGroup, DependencyPolicy, PackageType
  index.ts          # exports: policy (typed object) + resolvePolicy(type)
  policy/
    base.ts         # devDeps shared by every @finografic package
    cli.ts          # additions for genx:type:cli (picocolors as runtime dep)
    library.ts      # additions for genx:type:library (empty for now)
    config.ts       # additions for genx:type:config (empty for now)
    index.ts        # barrel re-export of all four

src/updater/        # dev-only — not built, not published, run via tsx
  index.ts          # entry: policy:outdated | policy:update | policy:audit
  collect.ts        # regex-parses policy source files → DepEntry[] with group metadata
  fetch.ts          # npm registry (public) + GitHub Packages (NPM_TOKEN) version fetch
  patch.ts          # in-place regex version string replacement
  audit.ts          # OSV querybatch vulnerability API
  display.ts        # picocolors grouped table + clack prompt helpers
  updater.types.ts  # DepEntry, DepEntryWithLatest, AuditEntry, OsvVulnerability
```

`base.ts` is structured as spread objects by concern group (build, testing, eslint, formatting,
hooks, ecosystem) merged into a single `devDependencies` map. The updater's display uses these
group names as section headers.

**`resolvePolicy(type)`** deep-merges `policy.base` + `policy[type]` → used by genx to get the
effective dep set for a given package type.

## Stack

- TypeScript strict, ESM (`"type": "module"`)
- `tsdown` → `dist/` (three entry points: `index`, `policy/index`, `types`)
- Output: `.mjs` / `.d.mts` — `package.json` exports reference these directly
- Published to `https://npm.pkg.github.com` under `@finografic` scope
- Updater runs via `tsx` — not part of the build

## Schema / Types

| Type               | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| `DependencyGroup`  | `{ dependencies?, devDependencies?, peerDependencies? }` |
| `PackageType`      | `'cli' \| 'library' \| 'config'`                         |
| `DependencyPolicy` | `{ base, cli, library, config: DependencyGroup }`        |

## Policy updater — key facts

- Auth: `NPM_TOKEN` in `.env` (gitignored) — same GitHub PAT as `~/.npmrc`
- `@finografic/*` packages fetch from `npm.pkg.github.com` with that token
- `pnpm policy:outdated` — read-only check, no writes
- `pnpm policy:update` — patches version strings directly in `src/policy/*.ts` source files
- `pnpm policy:audit` — OSV database, skips `@finografic/*` (no public CVE data)
- After `policy:update`: `pnpm build && pnpm typecheck`, commit, release, update genx

## Current state (as of 2026-04-10)

`pnpm policy:outdated` shows **14 of 21 packages outdated**. Notable:

| Package         | Policy    | Latest    | Note                           |
| --------------- | --------- | --------- | ------------------------------ |
| `typescript`    | `^5.9.3`  | `^6.0.2`  | Major bump — test carefully    |
| `eslint`        | `9.39.2`  | `10.2.0`  | Major, pinned — test carefully |
| `@eslint/js`    | `^9.39.2` | `^10.0.1` | Tied to eslint major           |
| `@types/node`   | `^24.0.0` | `^25.6.0` | Node 25 types                  |
| `globals`       | `^17.3.0` | `^17.4.0` | Minor, safe                    |
| `lint-staged`   | `^16.2.7` | `^16.4.0` | Safe                           |
| `@commitlint/*` | `^20.2.0` | `^20.5.0` | Safe                           |

Recommended approach: bump safe minor/patch packages first, hold `typescript` and `eslint` major
bumps until the ecosystem (genx, eslint-config) is ready for those majors.

## Decisions

1. `base` holds everything in the standard genx template (build, test, lint, format, hooks,
   @types/node). Type-specific files only add what `base` does not cover. (2026-04-06)
2. `cli.ts` holds `picocolors` as a runtime `dependency`. (2026-04-06)
3. `library.ts` and `config.ts` are intentionally empty — all shared deps are in `base`. (2026-04-06)
4. Build outputs `.mjs`/`.d.mts` (tsdown ESM). (2026-04-06)
5. `eslint: '9.39.2'` is pinned without `^` — matches the genx template's pinned version. (2026-04-06)
6. `base.ts` structured as spread objects by concern group — cleaner and typed. (2026-04-06)
7. Updater uses registry API directly (not a temp pnpm proxy project) — no side effects,
   no install step, OSV for audit. (2026-04-10)

## Open questions

1. Should `library.ts` or `config.ts` diverge from `base`? Config packages probably don't
   need `vitest`. Defer until concrete need arises.
2. `genx deps-policy --update` flag — future: trigger the updater from genx since deps-policy
   is a hard genx dependency. Tracked in `docs/process/UPDATER_PLAN.md` under TODO.

## Docs

- `docs/MANUAL.md` — full authoritative reference (structure, authoring, updater, release, auth)
- `docs/process/UPDATER_PLAN.md` — design doc for the updater (API rationale, UX sketch)

## Release flow (reminder)

```bash
pnpm policy:update          # bump versions interactively
pnpm build && pnpm typecheck
git add src/policy/ && git commit -m "deps: bump <packages>"
pnpm release:github:patch   # or minor/major
pnpm release:publish

# then in genx:
pnpm update @finografic/deps-policy
git commit -m "deps: update deps-policy to <version>"
```
