# STAR source: @finografic/deps-policy

This is evidence-led source material, not a polished interview script. Claims are limited to the corrected Pass A dossier and the repository artifacts it cites.

## Stories

### S1. Policy drift needed one typed boundary

**Confidence:** EVIDENCED
**Evidence:** `9bc805b`, `d060f07`, `ffa6a80`; `src/index.ts`; `src/policy/`; `docs/todo/TODO_TOOLCHAIN_GENX.md`
**Period:** 2026-04-06 to 2026-05-26

**The problem.** Shared packages needed canonical dependency versions, then Node and pnpm versions also needed a home. The latter did not fit the existing dependency-policy shape.

**Why it mattered.** The repository records `@finografic/genx` as a consumer, but does not quantify wider adoption or the cost of drift.

**Options apparent from the history.** Shared development dependencies first moved into the base policy. Toolchain versions were later kept in a separate `ToolchainPolicy` export instead of being nested in `DependencyPolicy`.

**What was done.** Typed policy groups and `resolvePolicy()` established the package boundary; a separate toolchain contract preserved the distinction between package and runtime-manager versions.

**What it cost.** Consumers gained another export and integration contract, and the genx integration remained explicitly not started.

**Outcome.** The policy side shipped and current sources retain the separate boundary. Downstream completion is not evidenced.

**Reusable judgement.** Extend a standards package without weakening an established type model; a new category can justify a parallel contract rather than a convenient catch-all.

**Maps to:** platform-standards / TypeScript-boundaries / APIs-contracts

### S2. A source-oriented CLI failed after becoming global

**Confidence:** EVIDENCED
**Evidence:** `d17ec63`, `3e092b5`, `8c7068b`, `9267011`, `13a89cf`, `bf08307`; `src/deps-cli/`
**Period:** 2026-04-26 to 2026-05-31

**The problem.** A CLI that worked from repository source was published for global use, then policy files, `package.json`, and the release path resolved incorrectly outside the source working directory.

**Why it mattered.** The record directly states that `--release` and snapshot writes needed to work from any current directory.

**Options apparent from the history.** The original source-relative lookups remained briefly; successive fixes replaced them with package-root discovery and then centralised that resolution.

**What was done.** Package-root resolution became the common boundary for bundled paths, including update and release flows.

**What it cost.** Global distribution exposed assumptions hidden by local execution and required four problem-shaped follow-up commits over three days.

**Outcome.** The final recorded fix applied the shared resolver to the release pipeline. No automated regression test is recorded.

**Reusable judgement.** Test an installed CLI as a deployed artefact, from an unrelated directory, because source-tree success does not validate runtime path semantics.

**Maps to:** CI-CD-IaC / APIs-contracts / platform-standards

### S3. A public snapshot command became an internal side effect

**Confidence:** EVIDENCED
**Evidence:** `0ee5977`, `d43186a`; deleted `src/deps-cli/commands/snapshot/snapshot.help.ts`; README evolution
**Period:** 2026-04-26 to 2026-05-29

**The problem.** `genx` needed a zero-latency local policy snapshot, initially exposed as a standalone command, while manual policy edits could bypass the normal update path.

**Why it mattered.** A stale snapshot would leave the documented local-first consumer contract out of step with policy sources.

**Options apparent from the history.** Keep snapshotting public and explicit, or internalise it as update lifecycle behaviour. The history shows the second option replacing the first.

**What was done.** Snapshot writing moved to every update exit, the public snapshot command surface was removed, and release steps were folded into the update command.

**What it cost.** Update gained an implicit filesystem side effect and tighter coupling to the downstream local-development contract.

**Outcome.** The standalone help file was deleted and current documentation presents the simplified command surface. Behaviour for edits made without running update is not demonstrated.

**Reusable judgement.** Remove a public command when it represents an invariant the tool should maintain itself, but make the resulting side effect explicit.

**Maps to:** platform-standards / APIs-contracts / offline-sync

### S4. Two correct tables still produced a broken interface

**Confidence:** EVIDENCED
**Evidence:** `14d9f05`, `3511bf4`, `dce6412`; `src/deps-cli/output/deps.table.ts`; `src/deps-cli/commands/update/update.prompts.ts`
**Period:** 2026-04-22 to 2026-04-24

**The problem.** Static and interactive dependency rows used separate table instances, so identical data and columns began at different positions. Sharing an instance fixed the structural mismatch, but Clack's five-character prefix still differed from the three-character static margin.

**Why it mattered.** Version columns visibly shifted between display and selection, making update choices harder to scan.

**Options apparent from the history.** Continue compensating in separate renderers, or share layout state and retain only the unavoidable two-character adapter at the prompt boundary.

**What was done.** The display returned its `TableInstance` to the multiselect, then the first-column padding was reduced by exactly two characters for Clack rows.

**What it cost.** Rendering and prompting became coupled through the shared table instance, with a documented dependency on Clack's prefix geometry.

**Outcome.** The structural duplication was removed and the remaining platform-specific offset was isolated. No screenshot or automated visual test is recorded.

**Reusable judgement.** Share the calculation that establishes layout truth; isolate unavoidable framework compensation at the boundary where it occurs.

**Maps to:** front-end-performance / APIs-contracts

### S5. Shared terminal primitives replaced local copies

**Confidence:** EVIDENCED
**Evidence:** `845ac7d`, `33a6eb1`, `f149a52`, `221d685`, `7144b89`, `85510e9`; deleted `src/deps-cli/core/render-help/` and `src/deps-cli/tui/`; README evolution
**Period:** 2026-04-11 to 2026-04-29

**The problem.** Help, table, multiselect, section-title, and package-manager behaviour existed locally while the same concerns were becoming shared ecosystem infrastructure.

**Why it mattered.** The record shows copied help code and local TUI files, but does not quantify maintenance cost or consumers beyond `genx`.

**Options apparent from the history.** Retain local implementations, consume `@finografic/cli-kit`, or expose selected display primitives for other tools. The history shows the latter two used together.

**What was done.** Local help and TUI trees were deleted in favour of cli-kit, repeated command help guards became `withHelp`, and the policy package exported its domain-specific display layer for `genx`.

**What it cost.** The repository took a runtime dependency on cli-kit and had to track its redesigned table API and import surface.

**Outcome.** Current architecture retains cli-kit for generic terminal behaviour and a policy-owned display export for domain rendering.

**Reusable judgement.** Centralise stable infrastructure primitives, but leave domain presentation with the package that owns the data and semantics.

**Maps to:** platform-standards / APIs-contracts / TypeScript-boundaries

## Real numbers safe to use

- `176` commits from 2026-04-06 to 2026-07-24.
- `130` commits landed in April, `33` in May, `4` in June, and `9` in July 2026.
- Current recorded package version: `0.26.10`; tags run from `v0.1.0` to `v0.26.10`.
- `3` runtime dependencies and `6` configured ESM build entry points.
- `3` policy-management commands are exposed in development scripts: outdated, update, and audit.
- `0` test files and `0` Vitest configuration files were found, although Vitest is a development dependency.
- CI runs `4` repository checks after install: code lint, Markdown lint, typecheck, and format check.
- One downstream consumer, `@finografic/genx`, is named in commits and documentation. This is not evidence of the total consumer count.

## Numbers not to claim

- User, team, repository, download, or organisation-wide adoption counts.
- Time saved, maintenance reduction, defect reduction, or productivity percentages.
- CLI or build performance improvements, including latency or throughput.
- Test coverage percentages or prevented-regression counts.
- Security findings prevented or vulnerabilities remediated through OSV audit.
- A completed genx toolchain rollout, because the repository marks that integration as not started.

## Honest weaknesses

- There are no discovered test files or Vitest configuration, so behaviour such as installed-CLI path resolution lacks recorded automated regression coverage.
- CI validates lint, Markdown, types, and formatting, but the recorded CI job does not run tests or build the package.
- The roadmap has almost no maintained milestone history, and there are no `DONE_*.md` records, which weakens evidence for prioritisation and outcomes.
- The updater remained a churn hotspot, with `update.cli.ts` touched in `21` commits over about seven weeks.
- Snapshot creation is an update side effect; the record does not demonstrate freshness after a direct manual source edit that is not followed by update.
- Toolchain policy exists, but downstream genx integration is explicitly unfinished.

## Reversals and changes of mind

- **Updater location and shape:** `2ca2c0f` introduced `src/updater/`; `d716eaa` renamed it to `src/deps-cli/`, normalised dispatch, and extracted prompts.
- **Help ownership:** `845ac7d` copied local render-help code; `33a6eb1` later deleted it in favour of cli-kit, then `221d685` replaced per-command guards with a boundary wrapper.
- **TUI ownership:** local TUI utilities introduced with the CLI were deleted by `33a6eb1`; later commits consumed shared cli-kit tables, multiselect, section titles, and package-manager behaviour.
- **Table layout:** separate table instances were replaced by one shared `TableInstance` in `14d9f05`; `dce6412` then added a narrow two-character Clack-prefix correction rather than reopening the shared model.
- **Snapshot surface:** `0ee5977` added a standalone snapshot command; `d43186a` removed its public help and internalised snapshot writing into update exits.
- **Release workflow:** release began as package-script chaining in `0ee5977`; `d43186a` inlined the steps, and `3e092b5` moved `--release` into the global update command.
- **Lint stack:** `9875779` replaced ESLint configuration with `@finografic/oxc-config` and deleted `eslint.config.ts`; the evidence records the replacement but not its motivation.
- **Markdown tooling:** `03d760d` and `f2ee1d1` replaced markdownlint plugins and local preview assets with `@finografic/md-lint`; the reason is not recorded.
- **Policy scope:** `d060f07` moved shared development dependencies into base and emptied library-specific policy; this is consolidation, but the decision rationale is only partly recorded.
- **CLI reach:** the updater began dev-only in `2ca2c0f`, gained a programmatic API and `policy` binary in `d17ec63`, then became the `deps-policy` global CLI in `3e092b5`.

## Timeline narrative

The repository began on 2026-04-06 as typed dependency-policy data with a merge utility and build configuration. Within days, the policy expanded to the shared development stack and gained a dev-only updater for outdated checks, source patching, and OSV audit. The updater was reorganised quickly as command boundaries, help, and dynamic terminal layout emerged from the first implementation. Generic help and TUI code then moved to `@finografic/cli-kit`, while this package retained and later exported dependency-specific display behaviour. Repeated table work converged on a shared layout instance plus a small Clack-specific prefix correction. In late April, the package moved beyond dev scripts by adding programmatic commands, a binary, and a local snapshot contract for `genx`. Snapshot and release operations were subsequently internalised into update behaviour, and the binary became a global `deps-policy` command. Global use exposed source-relative path assumptions, leading to a short sequence of package-root fixes and centralisation. A separate toolchain policy added Node and pnpm standards, but its documented genx integration remains unfinished. Activity fell sharply after May, with later commits mainly maintaining policy versions and project infrastructure.
