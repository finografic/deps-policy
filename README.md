# **@finografic/deps-policy**

> Central dependency policy for the `@finografic` ecosystem — single source of truth for package versions consumed by `genx` and other tooling.

## Installation

```bash
pnpm add @finografic/deps-policy
```

> Requires auth to GitHub Packages. See [GitHub Packages Setup](./docs/process/GITHUB_PACKAGES_SETUP.md).

## Usage

```typescript
import { policy, resolvePolicy } from '@finografic/deps-policy';

// Access a specific version from the policy
policy.base.devDependencies['typescript']; // '^5.9.3'
policy.cli.dependencies['picocolors'];     // '^1.1.1'

// Merge base + type-specific policy into one effective DependencyGroup
const effective = resolvePolicy('cli');
// → { dependencies: { picocolors }, devDependencies: { ...base, ...cli.devDeps } }
```

### Package types

| Type      | Description                                |
| --------- | ------------------------------------------ |
| `base`    | Shared devDeps for every `@finografic` pkg |
| `cli`     | Additional deps for `genx:type:cli`        |
| `library` | Additional deps for `genx:type:library`    |
| `config`  | Additional deps for `genx:type:config`     |

## Policy structure

```
src/
  types.ts           # DependencyGroup, DependencyPolicy, PackageType
  index.ts           # exports: policy, resolvePolicy()
  policy/
    index.ts         # re-exports base, cli, library, config
    base.deps.ts     # devDeps shared by every @finografic package
    cli.deps.ts      # additional deps for genx:type:cli packages
    library.deps.ts  # additional deps for genx:type:library packages
    config.deps.ts   # additional deps for genx:type:config packages
```

## Policy management CLI

Internal scripts for maintaining the policy source files. These are run inside this repo — not intended for consumers.

```bash
pnpm policy:outdated   # Show which policy packages have newer versions available
pnpm policy:update     # Interactively update outdated packages in policy files
pnpm policy:audit      # Check all packages against the OSV vulnerability database
```

**Command help:**

```bash
pnpm policy:outdated -- --help
pnpm policy:update -- --help
pnpm policy:audit -- --help
```

### CLI structure

The dev-only CLI lives under `src/deps-cli/`. Shared terminal primitives (`renderHelp`, `renderCommandHelp`, TUI column helpers, `multiselectLineBreak`, `runPnpmInstall`) come from **`@finografic/cli-kit`** — not from a local `src/core/` or `tui/` copy.

```
src/deps-cli/
  cli.ts                          # Entry point — command registry, root --help, --version
  cli.help.ts                     # Root HelpConfig (@finografic/cli-kit/render-help types)
  collect-deps.ts                 # Parse policy source files → DepEntry[]
  resolve-latest.ts               # Fetch latest versions from npm / GitHub Packages
  commands/
    audit/
      audit.cli.ts                # runAudit() — OSV vulnerability scan
      audit.logic.ts              # auditDeps() — pure query logic
      audit.help.ts               # CommandHelpConfig
      audit.constants.ts          # OSV API endpoint
    outdated/
      outdated.cli.ts             # runOutdated() — show version drift
      outdated.help.ts
    update/
      update.cli.ts               # runUpdate() — interactive update orchestrator
      update.logic.ts             # applyPatches() — file patching
      update.prompts.ts           # selectUpdatePatches() — clack + multiselectLineBreak
      update.options.ts           # createOutdatedSelectOptions() — multiselect rows
      update.help.ts
  output/
    audit.output.ts               # printAudit() — terminal table renderer
    outdated.output.ts            # printOutdated() — dynamic-width column table
  types/
    dep-metadata.types.ts         # DepEntry, DepEntryWithLatest
    audit.types.ts                # AuditResult
  utils/
    path.utils.ts                 # toProjectRelativePath()
    audit.utils.ts                # OSV query helpers
```

## Development

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
```

## Documentation

| Doc                                         | Purpose                                           |
| ------------------------------------------- | ------------------------------------------------- |
| [Manual](./docs/MANUAL.md)                  | Full reference: authoring, updater, release, auth |
| [Updater Plan](./docs/todo/UPDATER_PLAN.md) | Design doc for the `policy:*` CLI scripts         |

## License

MIT © [Justin](https://github.com/finografic)
