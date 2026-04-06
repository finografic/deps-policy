@AGENTS.md

# Claude-specific Instructions

## Project-Specific

- When adding a command, update the `commands` array in `src/gli.help.ts` and add a matching entry to the `EXAMPLES` section.

## Session Memory

Claude Code maintains a lightweight session log at `.claude/memory.md` (gitignored).

**On session start:** Read `.claude/memory.md` if it exists. Use it to understand recent context. If a `## Current Session` block exists, a previous session ended abruptly — resume or finish that work first.

**On task start:** Write a `## Current Session` block at the top of the file with:

- Date
- Brief description of the task
- A checklist of planned steps (`- [ ]` / `- [x]`)

Update the checklist as work progresses (check off items, add new ones if scope changes).

**On session end (or after significant work):** Collapse the `## Current Session` block into a normal `## <date>` entry (a 2-4 line summary), and move it below the previous sessions. Keep only the **last 5 session entries** (delete older ones when appending).

Keep only the **last 5 sessions** in the file (delete older entries when appending). Each entry should be 2-4 lines max — this is a breadcrumb trail, not a journal.
