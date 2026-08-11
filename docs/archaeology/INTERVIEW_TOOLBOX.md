# Interview toolbox: @finografic/deps-policy

Memory cues, not scripted answers. Choose the card that matches the question, then speak from what you remember.

## Card 1: Separate policy boundary

- **Situation:** Dependency versions were centralised; Node and pnpm standards did not fit that model.
- **Task:** Add toolchain policy without weakening `DependencyPolicy`.
- **Action:** Kept `ToolchainPolicy` as a separate typed export and documented the genx contract.
- **Result:** Policy-side work shipped; genx integration is still recorded as not started.
- **Trade-off/learning:** One more contract was cleaner than a catch-all type. Downstream completion must be tracked separately.
- **Evidence/confidence:** EVIDENCED, `9bc805b`, `d060f07`, `ffa6a80`, `TODO_TOOLCHAIN_GENX.md`.
- **Likely themes:** platform standards, TypeScript boundaries, contract design, unfinished work.
- **Cue phrase:** "New category, parallel contract."

## Card 2: Installed CLI paths

- **Situation:** The updater evolved from source-run tooling into a global CLI; source-relative paths then failed outside the repository.
- **Task:** Make policy, snapshot, package, and release paths independent of current working directory.
- **Action:** Introduced package-root discovery and centralised it across the bundled flows.
- **Result:** Four recorded fixes converged on one resolver; no regression test is recorded.
- **Trade-off/learning:** Distribution exposed assumptions local execution hid. Validate the installed artefact from an unrelated directory.
- **Evidence/confidence:** EVIDENCED, `8c7068b`, `9267011`, `13a89cf`, `bf08307`.
- **Likely themes:** debugging, CLI architecture, deployment boundaries, what to test differently.
- **Cue phrase:** "Works in source is not works when installed."

## Card 3: Snapshot reversal

- **Situation:** genx read an XDG snapshot for local-first policy updates; snapshotting began as a public command.
- **Task:** Keep the snapshot current without making maintainers remember another command.
- **Action:** Internalised snapshot writing into update exits and removed the standalone command surface.
- **Result:** Fewer public commands and a lifecycle-owned invariant; direct edits without update remain an unproved edge.
- **Trade-off/learning:** Simpler UX added an implicit filesystem side effect.
- **Evidence/confidence:** EVIDENCED, `0ee5977`, `d43186a`, deleted `snapshot.help.ts`.
- **Likely themes:** changing your mind, local-first tooling, API design, tolerated risk.
- **Cue phrase:** "Public command became an invariant."

## Card 4: Two-character table bug

- **Situation:** Static and interactive rows had matching definitions but separate layout instances, then Clack added a wider prefix.
- **Task:** Align version columns without spreading magic offsets through both renderers.
- **Action:** Shared one `TableInstance`; isolated the remaining five-versus-three prefix difference as a two-character adjustment.
- **Result:** One layout source of truth plus one boundary adapter; no visual regression test is recorded.
- **Trade-off/learning:** Prompting now depends on shared layout state and documented Clack geometry.
- **Evidence/confidence:** EVIDENCED, `14d9f05`, `dce6412`.
- **Likely themes:** UI debugging, shared state, interface boundaries, pragmatic fixes.
- **Cue phrase:** "Share the calculation, isolate the compensation."

## Card 5: Local copies to cli-kit

- **Situation:** Help and TUI primitives were copied locally while the ecosystem was developing shared CLI infrastructure.
- **Task:** Choose the boundary between generic terminal behaviour and dependency-specific presentation.
- **Action:** Deleted local help/TUI trees, consumed cli-kit, wrapped help at command boundaries, and exported the policy display layer for genx.
- **Result:** Current architecture keeps generic primitives shared and domain rendering local.
- **Trade-off/learning:** Reduced local ownership but introduced cli-kit coupling and API migration work.
- **Evidence/confidence:** EVIDENCED, `845ac7d`, `33a6eb1`, `221d685`, `85510e9`.
- **Likely themes:** platform adoption, reuse, package boundaries, reversal, dependency trade-offs.
- **Cue phrase:** "Share infrastructure, retain domain semantics."

## Claim guardrail

Safe anchors: `176` commits, 2026-04-06 to 2026-07-24, version `0.26.10`, `0` discovered test files, and one named consumer, genx. Do not claim adoption totals, performance or productivity gains, coverage, security outcomes, or completed genx toolchain integration.
