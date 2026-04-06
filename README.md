# 🦋 **@finografic/deps-policy**

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
policy.cli.dependencies['picocolors']; // '^1.1.1'

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
  types.ts        # DependencyGroup, DependencyPolicy, PackageType
  index.ts        # exports: policy, resolvePolicy()
  policy/
    base.ts       # devDeps shared by every @finografic package
    cli.ts        # additional deps for genx:type:cli packages
    library.ts    # additional deps for genx:type:library packages
    config.ts     # additional deps for genx:type:config packages
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Typecheck
pnpm typecheck

# Lint
pnpm lint
```

## Documentation

| Doc                                                                | Purpose                   |
| ------------------------------------------------------------------ | ------------------------- |
| [Dependency Policy Authoring Guide](./docs/process/DEPS_POLICY.md) | How to update the policy  |
| [Release Process](./docs/process/RELEASE_PROCESS.md)               | Versioning and publishing |
| [GitHub Packages Setup](./docs/process/GITHUB_PACKAGES_SETUP.md)   | Registry and token setup  |
| [Developer Workflow](./docs/process/DEVELOPER_WORKFLOW.md)         | Day-to-day workflow       |

## License

MIT © [Justin](https://github.com/finografic)
