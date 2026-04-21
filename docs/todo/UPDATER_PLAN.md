# Policy Updater — Design Plan

> **Status:** implemented — `src/deps-cli/` (entry: `cli.ts`, run via `pnpm policy:*` + `tsx`)

The policy source files (`src/policy/*.ts`) hold hardcoded version strings. This plan covers an interactive CLI tool that checks, updates, and audits those versions — without needing `pnpm outdated` to work on a fake install tree.

---

## Problem

- Policy deps are TypeScript literals, not installed packages → `pnpm outdated` doesn't see them.
- Manual bumping (edit string → build → commit → release) is tedious and error-prone.
- No audit coverage of the versions the ecosystem is actually pinned to.

---

## API choice: npm registry (direct)

**npmx.dev** was evaluated and ruled out: it is a UI browser with no public API, bot-protected (403 on all programmatic requests). It consumes the standard npm registry API and the OSV database internally — both of which we can hit directly.

| Purpose        | Endpoint                                                             |
| -------------- | -------------------------------------------------------------------- |
| Latest version | `GET https://registry.npmjs.org/{name}/latest` → `.version`          |
| Vulnerability  | `POST https://api.osv.dev/v1/querybatch` with package + version list |

**OSV** (`api.osv.dev`) is preferred over npm's own audit endpoint for the vulnerability command: it accepts a flat list of `(package, version)` pairs with no tree resolution required, returns structured advisory objects, and covers the npm ecosystem via the `npm` ecosystem key.

---

## Scope

Three operations:

| Script            | What it does                                                     |
| ----------------- | ---------------------------------------------------------------- |
| `policy:outdated` | Fetch npm latest for every policy dep; display what's behind     |
| `policy:update`   | Interactive multi-select → patch version strings in source files |
| `policy:audit`    | Query OSV for vulnerabilities across all policy deps             |

---

## Flattened dep map — with headers

The flattened dep list preserves its logical groupings as display headers, sourced from the category-level `const` blocks inside each policy file (e.g. `build`, `eslint`, `hooks`). The flat map carries a `group` field:

```ts
type DepEntry = {
  name: string;
  current: string; // full policy string, e.g. '^5.9.3'
  prefix: string; // '^' | '~' | '' (pinned)
  bare: string; // '5.9.3'
  group: string; // 'build' | 'eslint' | 'hooks' | ...
  sourceFile: string; // e.g. 'src/policy/base.deps.ts'
  depKind: 'dependencies' | 'devDependencies' | 'peerDependencies';
};
```

Groups are derived by parsing each policy file statically (or by convention: the category `const` variable names). Display order follows declaration order in the file.

**Outdated output — grouped:**

```
  base.deps.ts

    build
    ─────────────────────────────────────────────────────
    typescript          ^5.9.3   →  ^5.10.0   ✦ outdated
    tsdown              ^0.21.7  →  ^0.21.7   ✓
    @types/node         ^24.0.0  →  ^24.0.0   ✓

    eslint
    ─────────────────────────────────────────────────────
    eslint              9.39.2   →  9.40.0    ✦ outdated  (pinned)
    ...
```

---

## Where it lives

```
src/deps-cli/
  cli.ts                 # CLI entry — registry, root --help / --version
  cli.help.ts            # root HelpConfig
  collect-deps.ts        # parse policy *.deps.ts → DepEntry[]
  resolve-latest.ts      # registry fetch (latest version per package)
  commands/              # audit, outdated, update (orchestration + logic + prompts + help)
  output/                # audit.output.ts, outdated.output.ts
  types/                 # dep-metadata.types.ts, audit.types.ts
  utils/                 # audit.utils.ts, path.utils.ts
```

Not exported — no entry in `package.json` `exports`. Dev-only scripts only.

Uses **`@finografic/cli-kit`** for `render-help`, `tui`, and `package-manager` (`runPnpmInstall`). Other deps include `@clack/prompts`, `picocolors` (see root `package.json`).

---

## `policy:outdated`

1. `collect-deps.ts` — read policy `*.deps.ts` sources and flatten to `DepEntry[]`.
2. `resolve-latest.ts` — `GET https://registry.npmjs.org/{name}/latest` per dep, batched ~10 concurrent. `@finografic/*` packages on GitHub Packages will return 404 from the public registry — log as "private, skipped" without error.
3. Compare bare versions. Build outdated list.
4. Render grouped table (picocolors + `@finografic/cli-kit/tui` column widths).

---

## `policy:update`

Extends outdated. After fetching, split deps into two buckets:

**Bucket 1 — range-prefixed** (`^x.x.x`, `~x.x.x`):
Present as `multiselectLineBreak` (`@finografic/cli-kit/tui`). No rows pre-selected by default. On submit, rewrite each chosen entry: `prefix + latestVersion`.

**Bucket 2 — pinned** (`x.x.x`, no prefix):
For each pinned package where a newer version exists, prompt individually:

```
  ◆  eslint is pinned at 9.39.2 — latest is 9.40.0. Update?
  │  ○ No (keep pinned at 9.39.2)
  │  ○ Yes, pin to 9.40.0
  │  ○ Yes, and add range prefix (^9.40.0)
  └
```

Default is **No**. Processed after the bulk multi-select, one at a time.

**Patching** — `update.logic.ts` regex-replaces the version string in the source file:

```ts
// matches: 'package-name': 'x.x.x'  or  "package-name": "x.x.x"
const re = new RegExp(`(['"]${escapeRegex(name)}['"]\\s*:\\s*)(['"])[^'"]+(['"])`);
```

Replaces the version portion only, preserving surrounding syntax.

After all patches: show a per-file summary, confirm, write. Suggest commit message:

```
  └  Done. Commit with: deps: bump typescript, vitest, husky
```

---

## `policy:audit`

POST to `https://api.osv.dev/v1/querybatch`:

```json
{
  "queries": [
    { "package": { "name": "typescript", "ecosystem": "npm" }, "version": "5.9.3" },
    ...
  ]
}
```

Strip the range prefix before sending (OSV expects a concrete version). Skip private `@finografic/*` packages.

Parse `results[].vulns[]`. If none → print clean bill. Otherwise display grouped by severity: **critical → high → moderate → low** — package, CVE ID, title, link.

---

## clack UX sketch (`policy:update`)

```
  ◇  deps-policy updater
  │
  ◇  Fetching latest from npm registry... (23 packages)
  │
  ◆  Select packages to update  (4 outdated)
  │
  │  base.deps.ts › build
  │  ◼  typescript         ^5.9.3  →  ^5.10.0
  │  ◻  tsdown             ^0.21.7  (current)
  │
  │  base.deps.ts › hooks
  │  ◼  husky              ^9.1.7  →  ^9.2.0
  │  ◼  lint-staged        ^16.2.7 →  ^16.3.0
  └
  ◆  eslint is pinned at 9.39.2 — latest is 9.40.0. Update?
  │  ○ No (keep pinned)
  │  ○ Pin to 9.40.0
  │  ○ Add range prefix (^9.40.0)
  └
  ◇  Patched src/policy/base.deps.ts (3 changes)
  │
  └  Done. Suggested commit: deps: bump typescript, husky, lint-staged
```

---

## Open questions — resolved

| #   | Question                         | Resolution                                                                                                                                                                             |
| --- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Standalone scripts vs genx cmd   | Standalone `pnpm policy:*` scripts in this repo. TODO: future `genx deps-policy --update` flag — since deps-policy is a hard dep of genx, this could trigger the update flow via genx. |
| 2   | Import compiled vs source        | Not applicable — the policy files are not installed packages; the updater reads the source files statically or imports via `tsx`.                                                      |
| 3   | Private `@finografic/*` packages | Not an issue — you own the GitHub org and all tokens. 404s from the public registry on private packages: log "private — skipped" and move on.                                          |
| 4   | Pinned version handling          | Individual y/N prompt per pinned-but-outdated package, with three options: skip / pin to new / add `^` prefix. Default: skip.                                                          |

---

## TODO (future)

- `genx deps-policy --update` flag — trigger this update flow from genx, since deps-policy is a hard genx dependency. Avoids needing to switch repos to bump versions.
