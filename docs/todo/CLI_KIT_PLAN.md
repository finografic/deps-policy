# `@finografic/cli-kit` — Planning Document

**Status:** Planning
**Feeds into:** `CLI_CORE.md` (authoritative spec once kit ships)
**Sources examined:** `@finografic-genx`, `@finografic-gli`, `@finografic-deps-policy/src/deps-cli/`
**Last updated:** 2026-04-11

The three existing CLI projects each solved the same problems independently. This document extracts the best decisions from each, resolves the conflicts, and defines what `@finografic/cli-kit` will export. The `deps-cli/` layer in `deps-policy` serves as the proving ground for new patterns before they move into the kit.

---

## What `@finografic/cli-kit` Is

A **hard dependency** for every `@finografic` CLI package. It replaces the current `src/core/` copy-paste convention — instead of each repo maintaining its own copy of `flow/`, `render-help/`, etc., those modules live here and are imported as a real package.

The kit ships its own TypeScript declarations. Consumer projects do not need a `src/core/` folder — they import directly:

```ts
import { createFlowContext, promptSelect } from '@finografic/cli-kit/flow';
import { renderHelp, renderCommandHelp } from '@finografic/cli-kit/render-help';
import { confirmFileWrite } from '@finografic/cli-kit/file-diff';
```

`genx` will scaffold the kit dependency into every new CLI package it creates.

---

## Status of Existing `core/` Modules

These are already implemented (in `src/core/` across genx/gli) and will move into the kit verbatim or near-verbatim.

| Module        | Status       | Source of truth                          |
| ------------- | ------------ | ---------------------------------------- |
| `flow`        | Ready        | `@finografic-genx/src/core/flow/`        |
| `render-help` | Ready        | `@finografic-genx/src/core/render-help/` |
| `file-diff`   | Ready        | `@finografic-genx/src/core/file-diff/`   |
| `commands`    | Planned here | See section below                        |
| `tui`         | Partial      | `deps-cli/tui/` — needs promotion        |
| `paths`       | Partial      | `deps-cli/utils/path.utils.ts`           |

---

## Module: `commands`

> **Why commands before flows?**
>
> Flows are built for feature orchestration — multi-step interactive sequences where the user is guided through a series of decisions, often with a `-y` fast-path. They work well but they carry a specific shape (flag-driven, yes-mode, resolution chain).
>
> Commands are more fundamental. Every CLI has them. They appear in `deps-policy`, `genx`, and `gli` — but with three different signatures, three different `--help` approaches, and different file organization in each. A standardized command layer is the most broadly applicable piece of the kit.

---

### 1. Signature Standard

The three existing repos differ:

| Repo          | Signature                                    | Problem                                    |
| ------------- | -------------------------------------------- | ------------------------------------------ |
| `genx`        | `(argv: string[], context: { cwd: string })` | Positional, no destructuring, non-standard |
| `gli`         | `({ argv }: { argv: string[] })`             | Named params, no cwd                       |
| `deps-policy` | `(): Promise<void>`                          | No args at all                             |

**Standard (kit):**

```ts
export interface RunCommandParams {
  argv: string[];
  cwd: string;
}

export type CommandHandler = (params: RunCommandParams) => Promise<void> | void;
```

Every command entry-point exports a function named `run{Name}Command` that accepts this shape:

```ts
export async function runUpdateCommand({ argv, cwd }: RunCommandParams): Promise<void> {
  // ...
}
```

`cwd` is always provided — commands should not call `process.cwd()` internally. The `cli.ts` entry point passes it down:

```ts
await commands[command]({ argv: args, cwd });
```

---

### 2. File Structure

Combines gli's folder-per-command layout with deps-policy's file-separation pattern.

```
commands/
  {name}/
    index.ts             # barrel: re-exports run{Name}Command (required)
    {name}.command.ts    # orchestrator — wires the pieces, controls the clack flow
    {name}.logic.ts      # pure computation — no prompts, no terminal output (optional)
    {name}.prompts.ts    # interactive selection — clack only, returns data (optional)
    {name}.output.ts     # terminal rendering — console.log / clack.log only (optional)
    {name}.help.ts       # CommandHelpConfig for this command (optional)
    {name}.types.ts      # types scoped to this command (optional)
```

**When to split into sub-files:**

- `.logic.ts` — as soon as there is computation that could be unit-tested in isolation (version comparison, patch generation, change planning)
- `.prompts.ts` — as soon as a command has more than one interactive prompt or needs to return a structured selection result to the orchestrator
- `.output.ts` — when the rendering logic is more than a few lines or is shared between two commands
- `.help.ts` — when `--help` content is long enough to warrant its own file, or when it references constants from elsewhere in the command

**`deps-policy/commands/update/` is the canonical example of a well-split command:**

```
update/
  update.cli.ts      # orchestrator: intro, spinner, calls logic + prompts + output
  update.logic.ts    # applyPatches(), PatchInput type
  update.prompts.ts  # selectUpdatePatches() — clack multiselect + select loops
```

The orchestrator is short and readable. Each file has one job.

---

### 3. Naming

| Thing              | Convention          | Example             |
| ------------------ | ------------------- | ------------------- |
| Export function    | `run{Name}Command`  | `runUpdateCommand`  |
| Orchestrator file  | `{name}.command.ts` | `update.command.ts` |
| Logic file         | `{name}.logic.ts`   | `update.logic.ts`   |
| Prompts file       | `{name}.prompts.ts` | `update.prompts.ts` |
| Output file        | `{name}.output.ts`  | `update.output.ts`  |
| Help config file   | `{name}.help.ts`    | `update.help.ts`    |
| Help config export | `{name}Help`        | `updateHelp`        |
| Types file         | `{name}.types.ts`   | `update.types.ts`   |
| Barrel             | `index.ts`          | —                   |

> **Note on `.command.ts` vs `.cli.ts`:** genx and deps-policy use `.cli.ts`. gli uses `.command.ts`. The kit standardizes on `.command.ts` — it's more descriptive and avoids ambiguity with the root `cli.ts` entry point.

---

### 4. `--help` Integration

Every command handles `--help` / `-h` as its first check. There is no global `--help` intercept at the `cli.ts` level for per-command help — each command owns its own help output.

**Pattern (inside `{name}.command.ts`):**

```ts
import { renderCommandHelp } from '@finografic/cli-kit/render-help';

export async function runUpdateCommand({ argv }: RunCommandParams): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    renderCommandHelp(updateHelp);
    return;
  }
  // ...
}
```

If the help config is short (≤ ~20 lines), inline it. Otherwise extract to `{name}.help.ts`:

```ts
// update.help.ts
import type { CommandHelpConfig } from '@finografic/cli-kit/render-help';

export const updateHelp: CommandHelpConfig = {
  command: 'policy update',
  description: 'Interactively update outdated packages in policy files',
  usage: 'policy update [options]',
  options: [
    { flag: '-y', description: 'Auto-accept all updates (skip interactive prompts)' },
  ],
  examples: [
    { command: 'policy update', description: 'Interactive update' },
    { command: 'policy update -y', description: 'Accept all updates automatically' },
  ],
};
```

---

### 5. Subcommand Pattern

For commands with subcommands (like `gli config`), the orchestrator receives `argv` and routes internally. Use a subcommand registry instead of an if-chain — it parallels the root `cli.ts` registry pattern and is easier to extend:

```ts
type SubcommandHandler = (argv: string[], cwd: string) => Promise<void> | void;

export async function runConfigCommand({ argv, cwd }: RunCommandParams): Promise<void> {
  const [subcommand = '', ...subArgs] = argv;

  if (!subcommand || subcommand === '--help' || subcommand === '-h') {
    renderCommandHelp(configHelp);
    return;
  }

  const subcommands: Record<string, SubcommandHandler> = {
    add:    (a, c) => runAdd(a, c),
    list:   ()     => runList(),
    remove: (a)    => runRemove(a),
    path:   ()     => runPath(),
    edit:   ()     => runEdit(),
  };

  if (!subcommands[subcommand]) {
    console.error(`Unknown subcommand: ${subcommand}`);
    renderCommandHelp(configHelp);
    process.exit(1);
    return;
  }

  await subcommands[subcommand](subArgs, cwd);
}
```

Sub-handler functions are private (not exported from the barrel). Only `run{Name}Command` is public.

---

### 6. Flow Integration in Commands

Commands that have interactive prompts should use `createFlowContext()` from `@finografic/cli-kit/flow` for flag parsing. The `flow` object is created once in the orchestrator and passed into prompt functions:

```ts
import { createFlowContext, promptConfirm } from '@finografic/cli-kit/flow';

export async function runUpdateCommand({ argv }: RunCommandParams): Promise<void> {
  const flow = createFlowContext(argv, {
    y:     { type: 'boolean' },
    write: { type: 'boolean' },
  });

  // ...

  const patches = await selectUpdatePatches(entries, flow);
}
```

```ts
// update.prompts.ts
import type { FlowContext } from '@finografic/cli-kit/flow';

export async function selectUpdatePatches(
  entries: DepEntryWithLatest[],
  flow: FlowContext,
): Promise<PatchInput[]> {
  // Use flow.yesMode, promptConfirm(flow, ...), etc.
}
```

**When to NOT use flow:** Commands that have no flags and no interactive branching (e.g. `audit`, `outdated` in their current form) don't need `createFlowContext`. Add it when a `-y` fast-path or flag-driven behaviour is wanted.

---

### 7. Separation of Concerns — The Rule

Each file type has one strict responsibility. Violations are refactoring triggers.

| File          | Allowed                                                                     | Not allowed                              |
| ------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| `.command.ts` | Import and call everything. Clack intro/outro/spinner. `process.exit`.      | Business logic, raw computations         |
| `.logic.ts`   | Pure functions. Types. Exports.                                             | `clack.*`, `console.log`, `process.exit` |
| `.prompts.ts` | `clack.*` calls. Returns structured data. `process.exit(0)` on cancel only. | File I/O, business logic                 |
| `.output.ts`  | `clack.log.*`, `console.log`. Read-only access to data.                     | Any writes, side effects                 |
| `.help.ts`    | `CommandHelpConfig` constant. Imports from kit only.                        | Logic, prompts, imports from app         |
| `.types.ts`   | `interface`, `type`. No values.                                             | Functions, constants, imports            |

---

### 8. `cli.ts` Root Entry Point

The root `cli.ts` owns only routing and lifecycle. It has no business logic.

**Canonical shape (based on gli + genx synthesis, now present in deps-policy after today's refactor):**

```ts
#!/usr/bin/env node

import { createRequire } from 'node:module';
import process from 'node:process';
import { renderHelp } from '@finografic/cli-kit/render-help';

import { cliHelp } from './cli.help.js';
import { runAuditCommand } from 'commands/audit/index.js';
import { runOutdatedCommand } from 'commands/outdated/index.js';
import { runUpdateCommand } from 'commands/update/index.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

type CommandHandler = (params: { argv: string[]; cwd: string }) => Promise<void> | void;

async function main(): Promise<void> {
  const cwd = process.cwd();
  const [, , ...argv] = process.argv;
  const [command = '', ...args] = argv;

  if (!command || command === '--help' || command === '-h') {
    renderHelp(cliHelp);
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log(version);
    return;
  }

  const commands: Record<string, CommandHandler> = {
    audit:    (p) => runAuditCommand(p),
    outdated: (p) => runOutdatedCommand(p),
    update:   (p) => runUpdateCommand(p),
    help:     ()  => renderHelp(cliHelp),
  };

  if (!commands[command]) {
    console.error(`Unknown command: ${command}`);
    renderHelp(cliHelp);
    process.exit(1);
    return;
  }

  await commands[command]({ argv: args, cwd });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
```

**Rules for `cli.ts`:**

- No business logic
- No `clack.*` calls (the root is not a clack session)
- No direct `process.exit` except in the `main().catch()` and the unknown-command guard
- Version loaded via `createRequire` (ESM-safe, synchronous, no try-catch needed)

---

### 9. `cli.help.ts`

The root help file is a separate module, not inline in `cli.ts`. It imports `HelpConfig` from the kit and imports help content from per-command `.help.ts` files when the commands section is auto-assembled.

```ts
// src/cli.help.ts
import type { HelpConfig } from '@finografic/cli-kit/render-help';

export const cliHelp: HelpConfig = {
  main: {
    bin: 'policy',
    args: '<command>',
  },
  commands: {
    title: 'Commands',
    list: [
      { label: 'audit',    description: 'Check packages against OSV vulnerability database' },
      { label: 'outdated', description: 'Show which policy packages are outdated' },
      { label: 'update',   description: 'Interactively update outdated packages' },
      { label: 'help',     description: 'Show this help message' },
    ],
  },
  footer: {
    title: 'Show Help',
    list: [
      { label: 'policy <command> --help', description: '' },
    ],
  },
};
```

---

## Module: `prompts`

A thin clack wrapper layer — **not** the same as `core/flow`. The distinction:

- `cli-kit/flow` — full resolution chain: flag → yes-mode → interactive. Designed for feature orchestration with `-y` fast-paths.
- `cli-kit/prompts` — raw clack calls with cancel-handling built in. No `FlowContext` required. For commands that have interactive steps but no flag-driven fast-path.

Commands like `audit` and `outdated` do not need flow at all. Commands like `update` (before it gains `-y`) use prompts directly. Having a thin wrapper avoids boilerplate `if (clack.isCancel(x)) { clack.cancel(); process.exit(0); }` in every file.

**Candidate exports:**

```ts
// @finografic/cli-kit/prompts
export async function promptSelect<T>(opts: PromptSelectOpts<T>): Promise<T>
export async function promptMultiSelect<T>(opts: PromptMultiSelectOpts<T>): Promise<T[]>
export async function promptText(opts: PromptTextOpts): Promise<string>
export async function promptConfirm(opts: PromptConfirmOpts): Promise<boolean>
```

These are the same underlying clack calls as `core/flow`, but without the `FlowContext` parameter and without the flag/yesMode resolution chain. When a command later gains `-y` support, swap the import to `cli-kit/flow` and add the context — no structural change needed.

**Also candidate:** A generic `SelectOption<T>` interface and `createSelectOptions<T>` factory, extracted from `deps-policy`'s `update.options.ts`. Useful any time a command builds clack multiselect options from a typed array.

```ts
export interface SelectOption<T> {
  value: T;
  label: string;
  hint?: string;
  initialValue?: boolean;
}
```

---

## Module: `tui`

Proven in `deps-cli/tui/`. Two files with a clear separation that should carry into the kit:

- **`tui.constants.ts`** — floor values and display defaults (`TUI_DEFAULTS`). No functions.
- **`tui.utils.ts`** — utility functions that use those defaults (`padRight`, `createDivider`, `computeNameWidth`, `computeVersionWidth`).

The pattern from `deps-cli` (compute widths from live data, floor at defaults) is the correct approach — hardcoded column widths break on long package names. All table renderers must use `computeNameWidth` / `computeVersionWidth` rather than constants.

**Candidate exports:**

```ts
// @finografic/cli-kit/tui
export function padRight(value: string, width: number): string
export function padLeft(value: string, width: number): string
export function createDivider(width: number): string
export function computeNameWidth<T extends { name: string }>(entries: T[]): number
export function computeVersionWidth<T extends { current: string; latest?: string | null; prefix: string }>(entries: T[]): number
```

The `compute*` functions should accept generic constraints rather than domain-specific types, so they work for any CLI's tabular data.

---

## Module: `paths`

**Confirmed: not a kit module.** Small enough to live as `utils/paths.utils.ts` per-project. The `toProjectRelativePath` function is project-specific (it needs to know the project root); promoting it to a kit module would require passing `rootDir` explicitly everywhere, which eliminates the utility.

**What might still become a kit export:**

- `tildeify(absPath: string): string` — universally useful, no project-specific knowledge needed
- `resolveTargetDir(cwd: string, pathArg?: string): string` — used the same way in genx and gli

These two could be `cli-kit/paths` entries once a second repo needs them.

---

## Module: `xdg` (planned)

For CLIs that persist configuration or cache between runs. Wraps `XDG_CONFIG_HOME` / `XDG_CACHE_HOME` with JSONC read/write support.

```ts
// @finografic/cli-kit/xdg
export function getConfigPath(appName: string): string
export function getCachePath(appName: string): string
export async function readJsonc<T>(filePath: string): Promise<T | null>
export async function writeJsonc(filePath: string, data: unknown): Promise<void>
```

Depends on the JSONC utility already in `@finografic-genx/src/utils/jsonc.utils.ts`.

---

## Migration Path for Existing Repos

### `@finografic-deps-policy`

Most normalized as of 2026-04-11. The `deps-cli/` layer is the proving ground.

**Done:**

- [x] `updater/` → `deps-cli/`, `deps-cli/*` tsconfig alias, all `../../` imports replaced
- [x] `cli.ts` rewritten to main()/registry pattern; `CommandHandler = (argv: string[]) => Promise<void>`
- [x] `update.cli.ts` split into orchestrator + `update.logic.ts` + `update.prompts.ts` + `update.options.ts`
- [x] `select-packages.prompt.ts` moved into `commands/update/` (was wrong location)
- [x] `core/render-help/` added; `core/*` alias points to `./src/deps-cli/core/*`
- [x] `--help` wired to all commands via argv passthrough
- [x] TUI column widths computed from live data (`computeNameWidth`, `computeVersionWidth`)
- [x] `tui.config.ts` converted from duplicate functions → `TUI_DEFAULTS` constants
- [x] README updated

**Remaining:**

- [ ] Rename `{name}.cli.ts` → `{name}.command.ts` (naming alignment)
- [ ] Add `index.ts` barrels to each command folder
- [ ] Full `RunCommandParams { argv, cwd }` signature (currently just `argv: string[]`)
- [ ] Add `-y` / flow support to `update` command (bring in `core/flow/`)
- [ ] Fix `path.utils.ts` — `toProjectRelativePath` uses `__dirname` (tsx polyfill); accept explicit `rootDir`

### `@finografic-gli`

Already uses the folder-per-command structure and `{ argv }` params. Gaps:

- [ ] Add `cwd` to `RunCommandParams` interface (currently missing)
- [ ] Remove the ad-hoc `src/core/` once the kit ships (import from kit instead)
- [ ] Normalize `.command.ts` naming (already there — no change needed)

### `@finografic-genx`

Most diverged. Uses flat `commands/` with `.cli.ts` files and `(argv, context)` positional params. Gaps:

- [ ] Rename `.cli.ts` → `.command.ts` and add `commands/{name}/` folder structure
- [ ] Wrap `argv.includes('--write')` / `argv.includes('-y')` calls in `createFlowContext`
- [ ] Remove `src/core/` once the kit ships

---

## Confirmed Decisions (from deps-cli proving ground)

These were open questions; they are now settled by actual implementation.

| Question                                                        | Decision                                         | Reason                                                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Pass `cwd` from `cli.ts`, or let commands call `process.cwd()`? | Pass from `cli.ts`                               | Testable, explicit, no hidden global reads                                                                              |
| Where do command-specific constants go?                         | Inline in the file that uses them                | Extract only when shared by 2+ files                                                                                    |
| `--help` in `cli.ts` or inside the command?                     | Inside the command                               | Commands own their help content                                                                                         |
| `flow` created in `cli.ts` or in the command?                   | In the command                                   | `cli.ts` doesn't know each command's flag shape                                                                         |
| `RunCommandParams.cwd` optional or required?                    | Required                                         | Callers always know it; avoids silent `process.cwd()` use                                                               |
| Where do command-specific option builders go?                   | In the command folder (e.g. `update.options.ts`) | `prompts/` is only for shared cross-command utilities                                                                   |
| Is `prompts/` a valid shared folder?                            | Only if genuinely cross-command                  | Don't create it preemptively; one-command files go in the command folder                                                |
| Should `deps-cli` be executable from genx?                      | No                                               | Different subjects: deps-cli authors policy files; genx deps syncs projects to policy                                   |
| Migration path for `core/` local copies → cli-kit?              | tsconfig alias only                              | `"core/*": ["./src/deps-cli/core/*"]` becomes `"core/*": ["./node_modules/@finografic/cli-kit/..."]`; zero code changes |

---

## Open Questions

| Question                                                                                               | Leans toward                                                           |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Should `prompts` module use the same opts interface shape as `flow`?                                   | Yes — makes upgrade path from prompts → flow frictionless              |
| Should `SelectOption<T>` live in `cli-kit/prompts` or `cli-kit/tui`?                                   | `cli-kit/prompts` — it's about what's selected, not how it's displayed |
| Should `compute*Width` functions in `cli-kit/tui` accept generic constraints or concrete domain types? | Generic constraints — more reusable                                    |
| Does `cli-kit/paths` get `tildeify` + `resolveTargetDir` as its first exports?                         | Yes — once a second repo needs them                                    |
