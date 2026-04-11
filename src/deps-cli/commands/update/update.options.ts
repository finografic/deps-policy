import { computeNameWidth, padRight } from 'deps-cli/tui/format.tui.js';
import { toProjectRelativePath } from 'deps-cli/utils/path.utils.js';
import pc from 'picocolors';
import type { DepEntryWithLatest } from 'deps-cli/types/deps.types.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption<T> {
  value: T;
  label: string;
  hint: string;
  initialValue: boolean;
}

// ─── Multiselect option builders ─────────────────────────────────────────────

export function createRangeSelectOptions(entries: DepEntryWithLatest[]): SelectOption<DepEntryWithLatest>[] {
  const filtered = entries.filter((e) => e.outdated && !e.pinned);
  const nameWidth = computeNameWidth(filtered);

  return filtered.map((e) => ({
    value: e,
    label: `${padRight(e.name, nameWidth)} ${pc.dim(e.current)} → ${pc.green(`${e.prefix}${e.latest}`)}`,
    hint: toProjectRelativePath(e.sourceFile),
    initialValue: true,
  }));
}
