# AGENTS.md — AI Assistant Guide

## Project Memory Model

- `docs/todo/ROADMAP.md` = milestone plan and completed history.
- `docs/todo/NEXT_STEPS.md` = near-term tasks and manual checks.
- `.agents/handoff.md` = stable current project state.
- `.agents/memory.md` = chronological session log.

Promote durable findings from memory → handoff, priorities → roadmap, and concrete follow-ups → next steps.

Reference: [`docs/process/PROJECT_MEMORY_MODEL.md`](./docs/process/PROJECT_MEMORY_MODEL.md)

---

## Roadmap and Planning Docs

- Check `ROADMAP.md` before proposing new initiatives.
- Use `NEXT_STEPS.md` for small follow-ups and manual validation.
- Keep detailed plans in `docs/todo/TODO_*.md`; graduate completed plans to `DONE_*.md`.
- Follow `.github/instructions/documentation/todo-done-docs.instructions.md`.

---

## Rules — Project-Specific

- Project-specific rules live in `.github/instructions/project/**/*.instructions.md`.
- Do not reference `@workspace/*` — all imports and deps must use published package names.

## Rules — Global

Rules are canonical in `.github/instructions/` — see `README.md` there for folder structure.
Shared across Claude Code, Cursor, and GitHub Copilot.

**General**

- General baseline: `.github/instructions/general.instructions.md`

**Code**

- TypeScript patterns: `.github/instructions/code/typescript-patterns.instructions.md`
- Modern TS patterns: `.github/instructions/code/modern-typescript-patterns.instructions.md`
- Oxlint & style: `.github/instructions/code/linting-code-style.instructions.md`
- Provider/context patterns: `.github/instructions/code/provider-context-patterns.instructions.md`
- Picocolors CLI styling: `.github/instructions/code/picocolors-cli-styling.instructions.md`

**Naming**

- File naming: `.github/instructions/naming/file-naming.instructions.md`
- Variable naming: `.github/instructions/naming/variable-naming.instructions.md`

**Documentation**

- Documentation: `.github/instructions/documentation/documentation.instructions.md`
- README standards: `.github/instructions/documentation/readme-standards.instructions.md`
- Agent-facing markdown: `.github/instructions/documentation/agent-facing-markdown.instructions.md`
- Feature design specs: `.github/instructions/documentation/feature-design-specs.instructions.md`
- TODO/DONE docs: `.github/instructions/documentation/todo-done-docs.instructions.md`

**Git**

- Git policy: `.github/instructions/git/git-policy.instructions.md`

---

## Rules — Markdown Tables

- Padded pipes: one space on each side of every `|`, including the separator row.
- Align column widths so all cells in the same column are equal width.

---

## Git Policy

- Do not include `Co-Authored-By` lines in commit messages.
- `.github/instructions/git/git-policy.instructions.md` (see Commits and Releases sections)

---

## Learned User Preferences

- Interactive `deps update` multiselect: no packages should be pre-selected by default.

## Learned Workspace Facts

- After replacing `simple-git-hooks` with Husky (e.g. via generator tooling), set `scripts.prepare` to `husky`; a leftover `simple-git-hooks` prepare script breaks `pnpm install`.
- The dev-only policy CLI under `src/deps-cli/` imports shared primitives from `@finografic/cli-kit` (`render-help`, `tui`, `package-manager`); do not reintroduce vendored `deps-cli/core` or parallel `tui/` copies for those concerns.
- The `deps update` command patches policy sources first, then may offer the same version bumps for `package.json` and optionally running `pnpm install`.
- For VS Code/Cursor `markdown.styles`, prefer local workspace or package paths; remote raw/gist URLs are often unreliable for loading as CSS in the Markdown preview.

---
