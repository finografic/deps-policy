# Dependency Policy — Authoring Guide

This is the canonical source of truth for dependency versions across the `@finografic` ecosystem.
Edit versions here. Consumers (e.g. `genx`) pick them up automatically on the next release.

---

## Getting started

### Prerequisites

- Node `>=24.3.0`, pnpm `>=10`
- Auth to GitHub Packages — see [GitHub Packages Setup](./process/GITHUB_PACKAGES_SETUP.md)

### First-time setup

```bash
pnpm install
pnpm build
```

---

## Policy structure

```
src/
  types.ts          # DependencyGroup, DependencyPolicy, PackageType
  index.ts          # exports: policy, resolvePolicy()
  policy/
    index.ts        # re-exports base, cli, library, config
    base.deps.ts    # devDeps shared by every @finografic package
    cli.deps.ts     # additional deps for genx:type:cli packages
    library.deps.ts # additional deps for genx:type:library packages
    config.deps.ts  # additional deps for genx:type:config packages
```

### Rules

- `base` — everything in the standard template: build tools, eslint stack, formatting, git hooks, commitlint, `@types/node`, vitest.
- Type-specific files (`cli`, `library`, `config`) — only what is _not_ already in `base`.
- `cli.dependencies` holds runtime deps (e.g. `picocolors`). `devDependencies` is for build-time only.

---

## Ongoing: updating a version

1. Edit the version string in `src/policy/base.deps.ts` (or the relevant `*.deps.ts` file).
2. Run `pnpm build && pnpm typecheck` — must pass clean.
3. Commit: `deps: bump <package> to <version>`
4. Release — see [Release Process](./process/RELEASE_PROCESS.md).
5. In `genx`: `pnpm update @finografic/deps-policy` then commit `deps: update deps-policy to <version>`.

### Example — bumping TypeScript

```ts
// src/policy/base.deps.ts
devDependencies: {
  typescript: '^5.10.0',   // was '^5.9.3'
  // ...
}
```

---

## Ongoing: adding a package to the policy

Decide which policy file owns it:

| Applies to   | File                         |
| ------------ | ---------------------------- |
| All packages | `src/policy/base.deps.ts`    |
| CLI only     | `src/policy/cli.deps.ts`     |
| Library only | `src/policy/library.deps.ts` |
| Config only  | `src/policy/config.deps.ts`  |

Add the entry, build, commit, release.

Then in `genx`, add a matching entry to `src/config/dependencies.rules.ts` referencing `dev['package-name']`.

---

## Consuming the policy (for reference)

```ts
import { policy, resolvePolicy } from '@finografic/deps-policy';

// Full policy object
policy.base.devDependencies['typescript']; // '^5.9.3'
policy.cli.dependencies['picocolors']; // '^1.1.1'

// Merged effective policy for a given package type
const effective = resolvePolicy('cli');
// → { dependencies: { picocolors }, devDependencies: { ...base, ...cli.devDeps } }
```

---

## Related documentation

| Doc                                                         | Purpose                   |
| ----------------------------------------------------------- | ------------------------- |
| [Release Process](./process/RELEASE_PROCESS.md)             | Versioning and publishing |
| [GitHub Packages Setup](./process/GITHUB_PACKAGES_SETUP.md) | Registry and token setup  |
