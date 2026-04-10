import pc from 'picocolors';
import type { DepEntryWithLatest } from '../types/deps.types.js';

import { padRight } from '../tui/format.tui.js';
import { toProjectRelativePath } from '../utils/path.utils.js';

// ─── Layout constants ─────────────────────────────────

const COL = { name: 32, version: 12 } as const;

// ─── Multiselect option builders ─────────────────────────────────────────────

export interface SelectOption<T> {
  value: T;
  label: string;
  hint: string;
  initialValue: boolean;
}

export function createRangeSelectOptions(entries: DepEntryWithLatest[]): SelectOption<DepEntryWithLatest>[] {
  return entries
    .filter((e) => e.outdated && !e.pinned)
    .map((e) => ({
      value: e,
      label: `${padRight(e.name, COL.name)} ${pc.dim(e.current)} → ${pc.green(`${e.prefix}${e.latest}`)}`,
      hint: toProjectRelativePath(e.sourceFile),
      initialValue: true,
    }));
}
