# Evidence: @finografic/deps-policy

📅 Jul 30, 2026

## Scope and collection commands

Pass A mechanical evidence only. Commands were run against the working tree on 2026-07-30; `git status --short` returned no output before collection.

```sh
git log --oneline | wc -l
git log --format='%ad' --date=format:'%Y-%m' | sort | uniq -c
git log --oneline --reverse | head -40
git tag --sort=creatordate --format='%(creatordate:short) %(refname:short)'
git log -i --extended-regexp --grep='revert|undo|rollback|back out|instead of|replace' --oneline
git log -i --extended-regexp --grep='BREAKING|breaking change|migrate|migration' --oneline
git log -i --extended-regexp --grep='fix|bug|regression|flake|leak|slow|perf|race' --oneline
git log -i --extended-regexp --grep='refactor|rewrite|extract|consolidate|simplify' --oneline
git log --pretty=format: --name-only | grep -v '^$' | sort | uniq -c | sort -rn | head -40
git log --follow --format='%h %ad %s' --date=short -- README.md
git log --format='%h %ad %s' --date=short -- docs/
git log --follow -p --format='%h %ad %s' --date=short -- docs/todo/ROADMAP.md
```

## Shape

- Total commits: `176`.
- First commit date: `2026-04-06` (`b0d648e 🌱 Genesis`).
- Last commit date: `2026-07-24`.
- Largest adjacent commit-date gap: `25.33` days, between `2026-04-30` and `2026-05-26`; no gap longer than one month was found.

### Activity histogram by month

| Month     | Commit count |
| --------- | ------------ |
| `2026-04` | 130          |
| `2026-05` | 33           |
| `2026-06` | 4            |
| `2026-07` | 9            |

### First 40 commits

```text
b0d648e 🌱 Genesis
9bc805b feat: implement deps-policy source and build config
d060f07 feat: expand policy to full @finografic shared stack
575001e docs: add deps-policy authoring guide
f526d2d feat: eslint + oxfmt added, files formatted
720b678 0.2.0
9cb05b4 docs: deps policy fix
f6ccf48 docs: readme.md populated
ab294cc 0.2.1
5fbf227 0.2.2
29a461f fix(ci): ci.yml adjust
5d544f1 0.2.3
8a655a4 feat: base dependency policy file updated, organized
c798f63 0.3.0
ed93bda docs: update roadmap
30f3ad3 chore: formatting rle adjust
22555c3 0.3.1
2cb5f6b deps: update tsdown
796d49d 0.4.0
6f06fea deps: oxfmt-config updated
2ca2c0f feat: add policy updater CLI (policy:outdated, policy:update, policy:audit)
559cd25 refactor: organize commands into folders
ed8f799 0.5.0
7bfbb57 refactor: organize commands into folders
4f066ae 0.6.0
d716eaa refactor: rename updater/ → deps-cli/, normalize cli entry-point, extract update prompts
845ac7d feat: add render-help, fix dynamic TUI column widths, wire --help to all commands
85536f5 refactor: move select-packages.prompt.ts into update command; update README
ff24b91 chore: separate help in each command folder
e910d98 0.7.0
252534e chore: improve padding and alignment
45ba811 deps: version updates
0ff62d8 0.8.0
db7a962 deps: husky + commitlint installed
606262c 0.8.1
50aca4f 0.9.0
db68275 deps: husky + commitlint installed
ba9939e docs: agent instructions updated
a155963 docs: agent instructions updated
03d760d feat: replace eslint-plugin-markdownlint with @finografic/md-lint in base policy
```

### Version tag timeline

```text
2026-04-06 v0.1.0 v0.2.0 v0.2.1 v0.2.2 v0.2.3 v0.3.0
2026-04-07 v0.3.1 v0.4.0
2026-04-11 v0.5.0 v0.6.0 v0.7.0 v0.8.0 v0.8.1 v0.9.0 v0.9.1 v0.9.2
2026-04-13 v0.9.3 v0.10.0 v0.10.1
2026-04-14 v0.11.0
2026-04-19 v0.12.0 v0.12.1
2026-04-21 v0.13.0 v0.13.1 v0.13.2
2026-04-25 v0.14.0 v0.15.0 v0.15.1 v0.15.2 v0.15.3 v0.15.4 v0.15.5 v0.15.6 v0.15.7
2026-04-26 v0.15.8 v0.16.0
2026-04-27 v0.16.1 v0.16.2 v0.16.3
2026-04-29 v0.17.1 v0.17.2 v0.17.3 v0.18.0 v0.19.0 v0.19.1
2026-04-30 v0.20.0
2026-05-26 v0.21.0 v0.21.1 v0.22.0
2026-05-29 v0.23.0 v0.24.0 v0.24.1 v0.25.0 v0.26.0
2026-05-30 v0.26.1
2026-05-31 v0.26.2 v0.26.3 v0.26.4 v0.26.5 v0.26.6 v0.26.7
2026-06-02 v0.26.8
2026-06-27 v0.26.9
2026-07-24 v0.26.10
```

<!-- markdownlint-disable MD037 -->

## Long commit messages (verbatim)

The record-aware command below found 16 commit bodies longer than 200 characters. Bodies follow verbatim.

```sh
git log --format='%H%x09%ad%x09%s%x09%b%x1e' --date=short | \
  awk 'BEGIN { RS="\036"; FS="\t" } length($4) > 200 { print $1, length($4), $2 }'
```

### `9267011c5eb6470f4a481520081041e1a747fbee` 2026-05-29 fix: resolve package.json from package root in bundled CLI

> writePolicySnapshot and --version used createRequire paths that only
> work under src/. Use the same package-root walk as policy collection
> so genx managed deps silent pre-update completes snapshot writes.

### `3e092b51c9fca2e8a41ffbe4369c51346318b8bc` 2026-05-29 feat: add deps-policy global CLI with update --release

> Rename the published bin to deps-policy (policy alias kept), implement
> --release in the update command instead of a package.json script chain,
> and add thin deps-policy:* dev wrappers including update:release.

### `d43186a35ea5f6e19b8d172c42042b2e64bf8f5d` 2026-05-29 refactor: simplify policy scripts and internalize snapshot

> Collapse policy updater scripts to four entries, inline release steps
> into policy:update:release, and run writePolicySnapshot on every update
> exit so genx picks up manual policy edits without a public snapshot command.

### `ffa6a80d214710fb70a7bdd38b8f897106b79fe5` 2026-05-26 feat: add toolchain policy for node and pnpm versions

> New ToolchainPolicy type and toolchain export storing canonical
> node (24.3.0) and pnpm (10.32.1) versions as bare semver.
> Exported alongside the existing DependencyPolicy, included in
> the XDG snapshot, and documented in MANUAL.md with the genx
> consumption contract.

### `85510e9af890dc4c72f41472968a0d28668e3123` 2026-04-29 feat: add ./display export for external table/multiselect consumers

> Exposes printDepsTable, getDepsColumns, printDepsRow, DepEntryWithLatest
> type, and clack alignment constants so @finografic/genx can render the
> same grouped deps table and multiselect without duplicating display code.

### `0ee5977d333c06db6f492200bffb7dad2922346f` 2026-04-26 feat: add snapshot command and --yes flag for update

> snapshot: writes ~/.config/finografic/deps-policy.config.json with the
> full policy as JSON — genx reads this first, bypassing the published npm
> version for zero-latency local dev. Runs automatically at the end of
> policy:update and is available standalone as policy:snapshot / policy snapshot.
>
> --yes / -y on update: skips all interactive prompts, auto-selects every
> eligible package, auto-applies patches, package.json sync, and pnpm install.
>
> Also adds policy:release:patch script (build → version bump → publish).

### `d17ec6301bc340f0aab3f660dfdb1e8ab43eee8b` 2026-04-26 feat: export CLI commands as programmatic API and add policy bin

> - Add ./cli export entry (runUpdate, runOutdated, runAudit) for programmatic use by genx
> - Add policy bin pointing at dist/bin/policy.mjs for global terminal use
> - Add --include-pinned flag to update command (pinned packages excluded by default)
> - Highlight current version in white when a package is outdated
> - Update tsdown config to build two passes: library entries + bin entry
> - Update MANUAL.md and DEPS_POLICY.md with entry points table, terminal/programmatic usage, and flag docs

### `221d68528ff5c0b27e890202fcdaeadd0c728752` 2026-04-24 refactor(commands): replace help guards with withHelp wrapper

> Eliminates the repeated three-line if/renderCommandHelp/return block from all
> three commands. Each command now opens with withHelp(argv, help, async () => {
> ... }) — the help concern is handled at the boundary, the command body stays
> flat and focused on its task.

### `dce6412068f4ad58d114208804ea03864a57fc57` 2026-04-24 fix(update): compensate for clack multiselect prefix in name column width

```text
Clack's multiselect renders "│  □ " (guide bar + checkbox = 5 visible chars)
before each label. `CLACK_LEFT_MARGIN` is 3 chars. The 2-char difference means
multiselect label content starts further right than the static table above it,
shifting the version columns out of alignment.

Fix: inside `selectUpdatePatches`, derive `msColumns` from the passed-in
`columns` with the first column's `padding.right` reduced by
`CLACK_MULTISELECT_PREFIX_WIDTH` (2). This narrows only the multiselect
table's name column, pulling the version columns back into alignment without
touching the static table's layout.

`config.constants.ts` gains `CLACK_MULTISELECT_PREFIX_WIDTH = 2` with a full
comment explaining the geometry.
```

### `14d9f05a619d029e0b4b65d50ea861eefddd4297` 2026-04-24 refactor(deps-cli): wire shared table instance through display → multiselect

> Adopts the redesigned `@finografic/cli-kit` table API (`renderRow`,
> `totalWidth`, `ColumnPadding`) and eliminates the structural root of the
> table/multiselect column misalignment.
>
> **Root problem (was):** `printDepsTable` created one `TableInstance` and
> `selectUpdatePatches` independently called `createTable` with
> `{ prefixWidth: 1 }`, producing a second instance with a different internal
> prefix. Even with identical data and column defs, the two instances rendered
> content starting at different screen positions.
>
> **Changes:**
>
> `output/deps.columns.ts`
>
> - `offset: 3` → `padding: { right: 3 }` — same visual spacing, now
>   expressed in the explicit `ColumnPadding` shape.
>
> `output/deps.row.ts`
>
> - `table.render(entry)` → `table.renderRow(entry)` to match the renamed API.
>
> `output/deps.table.ts`
>
> - `printDepsTable` now **returns** its `TableInstance`. The caller threads
>   the instance into the multiselect, guaranteeing identical column widths.
> - `printGroupTitle` simplified: accepts `name: string` (was unnecessarily
>   generic `T extends { name }`); divider uses `table.totalWidth` directly
>   instead of recomputing `reduce + (n-1)*2`.
> - Imports reordered; inline `printDepsLine` call (no intermediate variable).
>
> `commands/update/update.options.ts`
>
> - Renamed `createSelectOptions` → `createDepsSelectOptions`.
> - Return type changed from `SelectOption<T>[]` to `MultiselectOption<T>[]`
>   — `SelectOption` lacked `initialValue`, requiring an unsafe cast.
> - Removed fallback `createTable` call; table is always provided by caller.
>
> `commands/update/update.prompts.ts`
>
> - `selectUpdatePatches(entries, table)` — table is now a required parameter.
> - Removed the second `createTable(actionable, …, { prefixWidth: 1 })` call
>   that was the source of the misalignment.
>
> `commands/update/update.cli.ts`
>
> - Captures the `TableInstance` returned by `printDepsTable` and passes it
>   to `selectUpdatePatches`.

### `85536f58f8f6b99871ce31bb3c4b3df29a9f52d2` 2026-04-11 refactor: move select-packages.prompt.ts into update command; update README

> - move deps-cli/prompts/select-packages.prompt.ts → commands/update/update.options.ts
>   (only used by update command; prompts/ folder removed)
> - update import in update.prompts.ts to use relative ./update.options.js
> - fix imports in update.options.ts to use deps-cli/* path aliases
> - update README: add Policy management CLI section, full deps-cli/ structure tree,
>   command help examples; remove stale emoji from heading

### `845ac7dd998bc6332ae24884b26567933919246c` 2026-04-11 feat: add render-help, fix dynamic TUI column widths, wire --help to all commands

> - add src/deps-cli/core/render-help/ (copied from genx core/render-help)
> - add core/* tsconfig path alias → src/deps-cli/core/*
> - add src/deps-cli/cli.help.ts with root HelpConfig for 'policy' bin
> - wire renderHelp(cliHelp) into cli.ts; add 'help' command to registry
> - pass argv through cli.ts command registry so commands can check --help
> - add renderCommandHelp() + --help guard to audit, outdated, update commands
> - fix outdated.output.ts: replace hardcoded COL widths with computeNameWidth/computeVersionWidth
> - fix select-packages.prompt.ts: compute name column from live data
> - add computeNameWidth(), computeVersionWidth() to tui/format.tui.ts
> - convert tui.config.ts from duplicate functions → TUI_DEFAULTS constants

### `d716eaa2657e22a51a99927129b0add28cef493a` 2026-04-11 refactor: rename updater/ → deps-cli/, normalize cli entry-point, extract update prompts

> - rename src/updater/ → src/deps-cli/ (step 1)
> - add deps-cli/* tsconfig path alias; replace ../../ imports in all command files (step 2)
> - rewrite cli.ts to main()/command-registry pattern matching genx/gli (step 3)
> - extract interactive selection logic from update.cli.ts → update.prompts.ts;
>   update.cli.ts now matches the shape of audit.cli.ts and outdated.cli.ts (step 4)
> - export PatchInput type from update.logic.ts

### `2ca2c0fd18d451cd80922d7665c25e4877a4ce85` 2026-04-10 feat: add policy updater CLI (policy:outdated, policy:update, policy:audit)

> Adds a dev-only interactive updater at src/updater/ that checks all
> policy dep versions against the npm registry and GitHub Packages,
> patches version strings in source files, and audits for known CVEs.
>
> - collect.ts: regex-parses policy source files into DepEntry[] with
>   group metadata (build, eslint, hooks, etc.) preserved for display
> - fetch.ts: batched fetches from registry.npmjs.org for public packages,
>   npm.pkg.github.com (NPM_TOKEN from .env) for @finografic/* packages
> - patch.ts: in-place regex replacement of version strings, handles both
>   quoted ('pkg') and bare (pkg) key syntax
> - audit.ts: OSV querybatch API — skips @finografic/* (no public data)
> - display.ts: picocolors table grouped by file/group, clack multiselect
>   for range-prefixed packages, per-entry select for pinned packages
> - index.ts: entry point dispatching outdated | update | audit commands
>
> New devDeps: @clack/prompts, picocolors, tsx
> New pnpm scripts: policy:outdated, policy:update, policy:audit
>
> Also adds docs/MANUAL.md — full reference for the package: structure,
> policy object, authoring, updater, release workflow, GitHub Packages
> auth. Updates README to point to the manual.

### `d060f07f09602c5aa9b982f082f963dbaa66b896` 2026-04-06 feat: expand policy to full @finografic shared stack

> - base: add complete build/test/lint/format/hooks/commitlint stack with pinned versions
> - cli: simplify to picocolors runtime dep only (shared devDeps moved to base)
> - library: clear to empty (all shared deps now in base)
> - @types/node moved to base since all packages receive it via the template

### `9bc805b0c1a45c58595195ba91e7fc7c1f1d3c38` 2026-04-06 feat: implement deps-policy source and build config

> - Add src/types.ts (DependencyGroup, PackageType, DependencyPolicy)
> - Add src/policy/{base,cli,library,config,index}.ts with initial version ranges
> - Add src/index.ts with policy object and resolvePolicy() merge utility
> - Add tsconfig.json and tsdown.config.ts (three entry points)
> - Add pnpm-lock.yaml
> - Fix package.json exports to reference .mjs/.d.mts (tsdown v0.20 default output)

<!-- markdownlint-enable MD037 -->

## Targeted commit archaeology

### Reversal and replacement keyword matches

`git log -i --grep='revert'` returned no commits. `git log -i --extended-regexp --grep='undo|rollback|back out|instead of|replace'` returned:

| SHA       | Date       | Subject                                                                                  |
| --------- | ---------- | ---------------------------------------------------------------------------------------- |
| `3e092b5` | 2026-05-29 | feat: add deps-policy global CLI with update --release                                   |
| `9875779` | 2026-04-29 | feat: replace eslint for oxc-config                                                      |
| `7144b89` | 2026-04-24 | feat(deps-table): use renderSectionTitle from cli-kit                                    |
| `221d685` | 2026-04-24 | refactor(commands): replace help guards with withHelp wrapper                            |
| `14d9f05` | 2026-04-24 | refactor(deps-cli): wire shared table instance through display → multiselect             |
| `f2ee1d1` | 2026-04-11 | deps: md-lint replaces markdownlint plugins                                              |
| `03d760d` | 2026-04-11 | feat: replace eslint-plugin-markdownlint with @finografic/md-lint in base policy         |
| `845ac7d` | 2026-04-11 | feat: add render-help, fix dynamic TUI column widths, wire --help to all commands        |
| `d716eaa` | 2026-04-11 | refactor: rename updater/ → deps-cli/, normalize cli entry-point, extract update prompts |
| `2ca2c0f` | 2026-04-10 | feat: add policy updater CLI (policy:outdated, policy:update, policy:audit)              |

`git log -i --grep='BREAKING|breaking change'` and `git log -i --grep='migrate|migration'` returned no commits.

### Problem-shaped keyword matches

| SHA       | Date       | Subject                                                                                  |
| --------- | ---------- | ---------------------------------------------------------------------------------------- |
| `2bc1fb8` | 2026-05-31 | chore: md-lint config fixed                                                              |
| `bf08307` | 2026-05-31 | fix: use resolvePackageRoot() in update release pipeline so --release works from any cwd |
| `13a89cf` | 2026-05-29 | fix: centralize package-root resolution for bundled CLI paths                            |
| `9267011` | 2026-05-29 | fix: resolve package.json from package root in bundled CLI                               |
| `8c7068b` | 2026-05-29 | fix: resolve policy sources from package root for global CLI                             |
| `b64ff56` | 2026-04-27 | ci: fixed cli-kit import source                                                          |
| `71cb38a` | 2026-04-25 | chore: eslint fixes                                                                      |
| `dce6412` | 2026-04-24 | fix(update): compensate for clack multiselect prefix in name column width                |
| `14d9f05` | 2026-04-24 | refactor(deps-cli): wire shared table instance through display → multiselect             |
| `d9fa00c` | 2026-04-19 | fix: .npmrc updated                                                                      |
| `85536f5` | 2026-04-11 | refactor: move select-packages.prompt.ts into update command; update README              |
| `845ac7d` | 2026-04-11 | feat: add render-help, fix dynamic TUI column widths, wire --help to all commands        |
| `2ca2c0f` | 2026-04-10 | feat: add policy updater CLI (policy:outdated, policy:update, policy:audit)              |
| `29a461f` | 2026-04-06 | fix(ci): ci.yml adjust                                                                   |
| `9cb05b4` | 2026-04-06 | docs: deps policy fix                                                                    |
| `9bc805b` | 2026-04-06 | feat: implement deps-policy source and build config                                      |

### Refactor-shaped keyword matches

| SHA       | Date       | Subject                                                                                    |
| --------- | ---------- | ------------------------------------------------------------------------------------------ |
| `d43186a` | 2026-05-29 | refactor: simplify policy scripts and internalize snapshot                                 |
| `221d685` | 2026-04-24 | refactor(commands): replace help guards with withHelp wrapper                              |
| `3511bf4` | 2026-04-24 | refactor(deps-cli): wire shared table instance through display → multiselect - adjustments |
| `14d9f05` | 2026-04-24 | refactor(deps-cli): wire shared table instance through display → multiselect               |
| `b09da39` | 2026-04-24 | refactor: improved table logic                                                             |
| `f149a52` | 2026-04-14 | refactor(update): source runPnpmInstall from @finografic/cli-kit                           |
| `85536f5` | 2026-04-11 | refactor: move select-packages.prompt.ts into update command; update README                |
| `d716eaa` | 2026-04-11 | refactor: rename updater/ → deps-cli/, normalize cli entry-point, extract update prompts   |
| `7bfbb57` | 2026-04-11 | refactor: organize commands into folders                                                   |
| `559cd25` | 2026-04-10 | refactor: organize commands into folders                                                   |
| `d060f07` | 2026-04-06 | feat: expand policy to full @finografic shared stack                                       |

### Deleted paths

The following deleted-path evidence is from `git log --diff-filter=D --name-only --format='%n%h %ad %s' --date=short`.

| SHA       | Date       | Subject                                                                                  | Deleted paths                                                                                                                                                                                                                                            |
| --------- | ---------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `d43186a` | 2026-05-29 | refactor: simplify policy scripts and internalize snapshot                               | `src/deps-cli/commands/snapshot/snapshot.help.ts`                                                                                                                                                                                                        |
| `b83dc1c` | 2026-05-29 | chore: deps + agent docs update                                                          | `.ai/handoff.md`; `.github/instructions/code/eslint-code-style.instructions.md`                                                                                                                                                                          |
| `9875779` | 2026-04-29 | feat: replace eslint for oxc-config                                                      | `eslint.config.ts`                                                                                                                                                                                                                                       |
| `9de21f3` | 2026-04-22 | feat: improve table and select options alignment using cli-kit                           | `src/deps-cli/output/outdate.utils.ts`; `src/deps-cli/output/outdated-V1.output.ts`; `src/deps-cli/output/outdated.output.ts`; `src/deps-cli/output/table/padding.ts`; `src/deps-cli/output/table/row.ts`; `src/deps-cli/output/table/width.ts`          |
| `33a6eb1` | 2026-04-21 | feat: cli-kit implemented for consistent finografic tui                                  | `src/deps-cli/core/render-help/help.types.ts`; `src/deps-cli/core/render-help/index.ts`; `src/deps-cli/core/render-help/render-help.utils.ts`; `src/deps-cli/tui/format.tui.ts`; `src/deps-cli/tui/multiselect.tui.ts`; `src/deps-cli/tui/tui.config.ts` |
| `f2ee1d1` | 2026-04-11 | deps: md-lint replaces markdownlint plugins                                              | `.vscode/markdown-custom-dark.css`; `.vscode/markdown-github-light.css`; `src/declarations.d.ts`                                                                                                                                                         |
| `d716eaa` | 2026-04-11 | refactor: rename updater/ → deps-cli/, normalize cli entry-point, extract update prompts | `src/updater/cli.ts`                                                                                                                                                                                                                                     |
| `559cd25` | 2026-04-10 | refactor: organize commands into folders                                                 | `src/updater/display.ts`; `src/updater/index.ts`; `src/updater/updater.types.ts`                                                                                                                                                                         |

## Churn hotspots

Source command:

```sh
git log --pretty=format: --name-only | grep -v '^$' | sort | uniq -c | sort -rn | head -40
```

| File                                             | Commits touching file | First to last touched date |
| ------------------------------------------------ | --------------------- | -------------------------- |
| `package.json`                                   | 119                   | 2026-04-06 to 2026-07-24   |
| `pnpm-lock.yaml`                                 | 44                    | 2026-04-06 to 2026-07-24   |
| `src/policy/base.deps.ts`                        | 35                    | 2026-04-13 to 2026-07-24   |
| `src/deps-cli/commands/update/update.cli.ts`     | 21                    | 2026-04-11 to 2026-05-31   |
| `src/deps-cli/commands/update/update.prompts.ts` | 13                    | 2026-04-11 to 2026-04-29   |
| `src/policy/base.ts`                             | 12                    | 2026-04-06 to 2026-04-13   |
| `src/deps-cli/commands/outdated/outdated.cli.ts` | 12                    | 2026-04-11 to 2026-04-29   |
| `src/policy/cli.deps.ts`                         | 11                    | 2026-04-13 to 2026-07-24   |
| `src/deps-cli/commands/update/update.options.ts` | 11                    | 2026-04-11 to 2026-04-29   |
| `src/deps-cli/output/deps.table.ts`              | 10                    | 2026-04-22 to 2026-05-26   |

## README evolution

### Revision timeline

```text
f6ccf48 2026-04-06 docs: readme.md populated
2ca2c0f 2026-04-10 feat: add policy updater CLI (policy:outdated, policy:update, policy:audit)
85536f5 2026-04-11 refactor: move select-packages.prompt.ts into update command; update README
e772917 2026-04-13 chore: update dependency versions
2d25522 2026-04-21 docs: updated to reflect changes
d43186a 2026-05-29 refactor: simplify policy scripts and internalize snapshot
3e092b5 2026-05-29 feat: add deps-policy global CLI with update --release
```

### First tracked version to midpoint (`f6ccf48` to `e772917`)

The diff adds a `Policy management CLI` section, three `pnpm policy:*` commands, command help examples, and a `src/deps-cli/` structure listing. It replaces the documentation table entries for the authoring guide, release process, GitHub Packages setup, and developer workflow with `Manual` and `Updater Plan` entries.

### Midpoint to current (`e772917` to `HEAD`)

The diff changes the policy filenames in the README structure listing to `index.ts`, `base.deps.ts`, `cli.deps.ts`, `library.deps.ts`, and `config.deps.ts`. It changes the documented CLI invocations from `pnpm policy:*` to `deps-policy` plus `pnpm deps-policy:*` development wrappers. It removes local `core/render-help/` and `tui/` entries from the CLI structure listing, adds references to `@finografic/cli-kit`, and changes the Updater Plan link from `docs/process/UPDATER_PLAN.md` to `docs/todo/UPDATER_PLAN.md`.

## Docs

### Documentation files found

`docs/` contains `DEPS_POLICY.md`, `MANUAL.md`, two files under `docs/deps/`, four files under `docs/process/`, and four files under `docs/todo/`. No `apps/client/docs/`, `apps/server/docs/`, or `packages/*/docs/` files were found.

### ROADMAP changes over time

`docs/todo/ROADMAP.md` has one history entry:

```text
c2c1f4b 2026-07-07 feat(ai-memory): genx managed audit used to add AI Memory (roadmap, handoff, session memory)
```

The creation diff contains a single unchecked Next item, `Review and update this list for the project`; P0 through P3 state that they have no items; and the Done table contains `_No completed milestones yet._`.

### DONE_*.md summaries

No tracked `docs/**/DONE_*.md` files were found. `git log --diff-filter=A --name-only --format='%h %ad' --date=short -- 'docs/**/DONE_*.md'` returned no files.

### Open TODO_*.md

| File                               | History                          | Current status text                                                              |
| ---------------------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| `docs/todo/TODO_TOOLCHAIN_GENX.md` | Added by `ffa6a80` on 2026-05-26 | `Not started. Policy-side work complete (2026-05-26). Genx integration pending.` |

### Other plan documents in `docs/todo/`

- `docs/todo/UPDATER_PLAN.md` states: `implemented — src/deps-cli/ (entry: cli.ts, run via pnpm policy:* + tsx)`.
- `docs/todo/CLI_KIT_PLAN.md` states: `Historical design notes`; its last-updated line is `2026-04-21`.

### TODO to DONE deltas

No `DONE_*.md` files or TODO-to-DONE renames were found in the tracked `docs/todo/` history.

## Current state

### Directory structure (two levels)

```text
.agents/                 .claude/                 .cursor/
.husky/                  .vscode/                 .github/
  instructions/            skills/                  workflows/
dist/
  bin/                     deps-cli/                policy/
docs/
  archaeology/             deps/                    process/                 todo/
src/
  deps-cli/                policy/
```

### Package and workspace configuration

- `package.json`: name `@finografic/deps-policy`, version `0.26.10`, `type: module`, and GitHub Packages publish registry `https://npm.pkg.github.com`.
- `pnpm-workspace.yaml` contains only `allowBuilds` entries for `esbuild` and `unrs-resolver`.
- Runtime dependencies: `@finografic/cli-kit`, `@finografic/core`, and `strip-ansi`.
- Development dependencies include `tsx`, `tsdown`, `typescript`, `vitest`, `oxlint`, `oxfmt`, Husky, lint-staged, and `@finografic/md-lint`.
- Scripts include `build` (`tsdown`), `typecheck` (`tsc --noEmit`), `lint` (`oxlint -c oxlint.config.ts`), `lint:md` (`md-lint`), `format:check` (`oxfmt --check`), and three `deps-policy:*` CLI scripts that run `tsx src/deps-cli/cli.ts`.
- `tsconfig.json` sets `strict: true`, `module: NodeNext`, and `moduleResolution: NodeNext`.
- `tsdown.config.ts` defines ESM builds for `index`, `policy/index`, `deps.types`, `cli`, `deps-cli/display`, and the `bin/deps-policy` entry.

### Tests

```text
test-files=0
vitest-configs=0
```

The counts are from `rg --files | rg '\.(test|spec)\.[cm]?[jt]sx?$'` and the equivalent config-name search. `vitest` is listed in `devDependencies`.

### CI and hooks

- `.github/workflows/ci.yml` triggers on pushes to `master` and on pull requests.
- Its `lint` job runs on `ubuntu-latest`, installs Node 24 and pnpm 10, runs `pnpm install --frozen-lockfile`, then runs `pnpm lint:ci`, `pnpm lint:md`, `pnpm typecheck`, and `pnpm format:check`, in that order.
- `.github/workflows/release.yml` triggers on `v*` tag pushes, then installs dependencies, runs `pnpm build`, publishes with `pnpm publish --no-git-checks`, and uses `softprops/action-gh-release@v2` with generated release notes.
- `.husky/commit-msg` runs `pnpm exec commitlint --edit "$1"`; `.husky/pre-commit` runs `pnpm exec lint-staged --allow-empty`.
