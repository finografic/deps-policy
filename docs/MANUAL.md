# @finografic/deps-policy — Manual

📅 Apr 26, 2026

Single authoritative reference for the `@finografic/deps-policy` package: what it is, how it's structured, how to maintain it, and how to release it.

---

## Overview

`@finografic/deps-policy` is the single source of truth for dependency versions across the `@finografic` ecosystem. Rather than each project independently managing which version of TypeScript, ESLint, or Vitest to install, all version decisions live here.

Consumers (`genx`, scaffolded projects) reference this package to:

- Know which version of each tool to install when creating a new project
- Align existing projects to the canonical versions during a `genx deps` update pass

The package exports plain TypeScript objects — no runtime logic, no network calls. It is a data package.

---

## Package structure

```
src/
  types.ts              # DependencyGroup, DependencyPolicy, PackageType
  index.ts              # exports: policy, resolvePolicy()
  policy/
    index.ts            # re-exports base, cli, library, config
    base.deps.ts        # devDeps shared by every @finografic package
    cli.deps.ts         # additional deps for genx:type:cli packages
    library.deps.ts     # additional deps for genx:type:library packages
    config.deps.ts      # additional deps for genx:type:config packages

src/deps-cli/           # built and published — CLI bin + programmatic API
  cli.ts                # bin entry — command registry, root --help / --version
  cli.help.ts           # root HelpConfig
  collect-deps.ts       # parse policy *.deps.ts sources → DepEntry[]
  resolve-latest.ts     # npm registry + GitHub Packages version fetch
  commands/
    index.ts            # programmatic API — re-exports runAudit, runOutdated, runUpdate
    audit/              # audit command
    outdated/           # outdated command
    update/             # update command
  output/               # terminal renderers (uses @finografic/cli-kit/tui for tables)
  types/                # DepEntry, DepEntryWithLatest, audit types
  utils/                # path + OSV helpers
```

Shared CLI primitives (`renderHelp`, `renderCommandHelp`, TUI layout helpers, `multiselectLineBreak`, `runPnpmInstall`) are imported from **`@finografic/cli-kit`**.

### Published entry points

| Export         | Dist file               | Purpose                                  |
| -------------- | ----------------------- | ---------------------------------------- |
| `.`            | `dist/index.mjs`        | Policy data — `policy`, `resolvePolicy`  |
| `./cli`        | `dist/cli.mjs`          | Programmatic runners — `runUpdate`, etc. |
| `./policy`     | `dist/policy/index.mjs` | Re-exports policy groups directly        |
| `./deps.types` | `dist/deps.types.mjs`   | Shared TypeScript types only             |
| `bin: policy`  | `dist/bin/policy.mjs`   | Terminal CLI — `policy <command>`        |

### Policy types

```ts
interface DependencyGroup {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

type PackageType = 'cli' | 'library' | 'config';
```

---

## Policy object

The exported `policy` object gives direct access to every group:

```ts
import { policy, resolvePolicy } from '@finografic/deps-policy';

policy.base.devDependencies['typescript']; // '^5.9.3'
policy.base.devDependencies['eslint']; // '9.39.2'
policy.cli.dependencies['picocolors']; // '^1.1.1'
```

`resolvePolicy(type)` merges `base` with the type-specific group into a single effective `DependencyGroup`:

```ts
const effective = resolvePolicy('cli');
// {
//   dependencies:    { picocolors: '^1.1.1' },
//   devDependencies: { typescript: '^5.9.3', vitest: '^4.0.18', ... }
// }
```

### Package types

| Type      | File                     | Used for                                         |
| --------- | ------------------------ | ------------------------------------------------ |
| `base`    | `policy/base.deps.ts`    | devDeps on every `@finografic` package           |
| `cli`     | `policy/cli.deps.ts`     | additional deps for `genx:type:cli` packages     |
| `library` | `policy/library.deps.ts` | additional deps for `genx:type:library` packages |
| `config`  | `policy/config.deps.ts`  | additional deps for `genx:type:config` packages  |

### Groups within `base`

`base.deps.ts` organises its `devDependencies` into named `const` groups. The policy CLI (`src/deps-cli/`) uses these group names as section headers when printing tables.

| Group        | Contents                                                                     |
| ------------ | ---------------------------------------------------------------------------- |
| `build`      | `typescript`, `tsdown`, `@types/node`                                        |
| `testing`    | `vitest`                                                                     |
| `eslint`     | `eslint`, `@eslint/js`, `@finografic/eslint-config`, full TS-ESLint stack    |
| `formatting` | `oxfmt`, `@finografic/oxfmt-config`                                          |
| `hooks`      | `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional` |
| `ecosystem`  | `@finografic/project-scripts`                                                |

---

## How genx consumes this package

`@finografic/genx` imports `policy` directly:

```ts
// src/config/dependencies.rules.ts
import { policy } from '@finografic/deps-policy';

const dev = policy.base.devDependencies ?? {};

export const dependencyRules: DependencyRule[] = [
  { name: 'typescript', version: dev['typescript'], section: 'devDependencies' },
  { name: 'vitest', version: dev['vitest'], section: 'devDependencies' },
  // ...
];
```

When genx runs `genx deps` (or `genx create`), it calls `pnpm add -D package@version` using the version strings from these rules — never `--latest`. The version is always explicit and sourced from this package.

After releasing a new `deps-policy` version, genx must be updated:

```bash
# in @finografic/genx
pnpm update @finografic/deps-policy
```

Then commit: `deps: update deps-policy to <version>`.

---

## Authoring the policy

### Adding a new package

1. Decide which file owns it:

   | Applies to   | File                         |
   | ------------ | ---------------------------- |
   | All packages | `src/policy/base.deps.ts`    |
   | CLI only     | `src/policy/cli.deps.ts`     |
   | Library only | `src/policy/library.deps.ts` |
   | Config only  | `src/policy/config.deps.ts`  |

2. In `base.deps.ts`, add to the appropriate `const` group block. If it doesn't fit an existing group, create a new one and spread it into the `DependencyGroup` export.

3. In `cli.deps.ts` / `library.deps.ts` / `config.deps.ts`, add directly to `dependencies` or `devDependencies` in the exported object.

4. Build and typecheck: `pnpm build && pnpm typecheck`

5. In `genx`, add a matching entry to `src/config/dependencies.rules.ts` referencing the policy value.

6. Commit: `deps: add <package> to policy`

### Updating a version manually

Edit the version string directly in the source file, then:

```bash
pnpm build && pnpm typecheck
```

Commit: `deps: bump <package> to <version>`

Then release (see [Release workflow](#release-workflow)).

### Prefix conventions

| Prefix | Meaning                        | Use for                                                 |
| ------ | ------------------------------ | ------------------------------------------------------- |
| `^`    | Compatible range (most common) | Stable packages with reliable semver                    |
| `~`    | Patch-only range               | Packages with unstable minor releases                   |
| none   | Pinned exact version           | Packages where minor/patch has caused issues (`eslint`) |

---

## Policy updater CLI

The updater CLI lives under `src/deps-cli/`. It checks all policy deps against the npm registry and GitHub Packages, and patches version strings in place. It is built and published as part of the package.

### Setup

The CLI reads GitHub Packages auth from `.env`:

```bash
# .env  (gitignored)
NPM_TOKEN=<your GitHub PAT with read:packages scope>
```

This token is the same one used by `.npmrc` to install `@finografic/*` packages locally.

### Terminal usage

**In this repo** (via `tsx` dev scripts):

```bash
pnpm policy:outdated          # check — display only, no writes
pnpm policy:update            # interactive update — patches source files
pnpm policy:update --include-pinned  # also include pinned packages in the update list
pnpm policy:audit             # vulnerability check via OSV database
```

**Globally installed** (after `pnpm link --global` or `npm install -g @finografic/deps-policy`):

```bash
policy outdated
policy update
policy update --include-pinned
policy audit
policy --help
policy --version
```

### Programmatic usage

Import individual runners from the `./cli` entry point. Each runner accepts an `argv` string array matching the flags the CLI accepts:

```ts
import { runUpdate, runOutdated, runAudit } from '@finografic/deps-policy/cli';

// Run interactively (same prompts as the terminal command)
await runUpdate([]);

// Pass flags
await runUpdate(['--include-pinned']);

// Show help for a command
await runUpdate(['--help']);
```

This is how `genx` can invoke policy commands without shelling out. The runners are self-contained — they manage their own clack output and process lifecycle.

---

### `policy:outdated`

Fetches the latest published version for every dep in the policy and displays a grouped table. No files are written.

- Public packages → `https://registry.npmjs.org`
- `@finografic/*` packages → `https://npm.pkg.github.com` with `NPM_TOKEN`
- Packages unavailable from either registry are shown as `(private)` and skipped

Output is grouped by file → group, showing only groups that contain at least one outdated entry. Packages on the latest version are shown as dim `✓`.

---

### `policy:update`

Runs the same fetch as `policy:outdated`, then opens interactive prompts. Pinned packages (no prefix) are excluded from the list by default — pass `--include-pinned` to include them.

**Range-prefixed packages** (`^x.y.z`, `~x.y.z`):

A multi-select list of outdated range-prefixed packages is shown. Nothing is pre-selected by default — choose the rows you want, then submit.

**Pinned packages** (no prefix, e.g. `9.39.2`):

Each outdated pinned package is handled individually, with a default of "skip":

```
  eslint is pinned at 9.39.2 — latest is 10.2.0. Update?
  ○ No, keep at 9.39.2         ← default
  ○ Pin to 10.2.0
  ○ Add range prefix (^10.2.0)
```

After all selections, the version strings are patched in-place in the source files. A suggested commit message is printed:

```
deps: bump typescript, vitest, lint-staged
```

After running `policy:update`:

1. Run `pnpm build && pnpm typecheck` to verify the patched versions compile cleanly.
2. Commit with the suggested message.
3. Release the package (see below).
4. Update genx: `pnpm update @finografic/deps-policy`.

---

### `policy:audit`

Sends all policy deps to the [OSV database](https://osv.dev) (`api.osv.dev/v1/querybatch`) and reports known vulnerabilities. `@finografic/*` packages are skipped (no public OSV data).

Results are grouped by severity: **critical → high → moderate → low**. A clean run prints:

```
  ✓ No known vulnerabilities in 18 packages.
```

> OSV audits concrete version numbers. The range prefix is stripped before querying (e.g. `^5.9.3` → `5.9.3`). This means the audit checks the floor of your declared range — if a vuln exists only in a version above the floor but within the range, it may not be flagged. Run `policy:update` first to ensure policy versions are current.

---

## Release workflow

### Pre-release check

`release:check` runs lint (with auto-fix) and typecheck. This is called automatically by the release scripts.

```bash
pnpm release:check
```

### Bump and publish

```bash
pnpm release:github:patch   # x.y.Z — backwards-compatible fix or dep bump
pnpm release:github:minor   # x.Y.0 — new policy group or new package type
pnpm release:github:major   # X.0.0 — breaking change to exported API
```

Each script:

1. Runs `release:check`
2. Bumps `version` in `package.json` via `pnpm version`
3. Pushes the commit and version tag to GitHub (`git push --follow-tags`)

The package must then be published manually:

```bash
pnpm release:publish
```

This publishes to GitHub Packages (`https://npm.pkg.github.com`).

### When to use each bump

| Change                                              | Bump  |
| --------------------------------------------------- | ----- |
| Version string update(s) — no API change            | patch |
| New policy group, new `PackageType`, new CLI export | minor |
| Renamed/removed export, type signature change       | major |

### After release

Verify the new version is visible:

```bash
pnpm view:registry:github
```

Then update `@finografic/genx`:

```bash
# in genx repo
pnpm update @finografic/deps-policy
# commit: deps: update deps-policy to <version>
```

---

## GitHub Packages auth

### Local development

Authentication is handled by `.npmrc` (repo-level and/or global):

```ini
@finografic:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<your GitHub PAT>
```

The token needs `read:packages` scope to install, `write:packages` scope to publish.

For the policy updater, the same token is loaded from `.env`:

```bash
NPM_TOKEN=<your GitHub PAT>
```

The `.env` file is gitignored. See `.env.example` for the key name.

### Creating a GitHub PAT

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens (or classic).
2. Classic token: select `read:packages` and `write:packages`.
3. Copy the token into `~/.npmrc` (for install/publish) and `.env` (for the updater).
