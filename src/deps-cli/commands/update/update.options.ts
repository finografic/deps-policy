import {
  computeNameWidth,
  computeVersionWidth,
  padLeft,
  padRight,
  TUI_DEFAULTS,
} from '@finografic/cli-kit/tui';
import pc from 'picocolors';

import { toProjectRelativePath } from 'utils/path.utils.js';

import type { DepEntryWithLatest } from 'types/dep-metadata.types.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption<T> {
  value: T;
  label: string;
  hint: string;
  initialValue: boolean;
}

// ─── Row renderer ─────────────────────────────────────────────────────────────

interface ColWidths {
  name: number;
  version: number;
}

function renderSelectLabel(e: DepEntryWithLatest, col: ColWidths): string {
  const name = padRight(e.name, col.name);
  const current = pc.dim(padLeft(e.current, col.version));
  const next = pc.green(padLeft(`${e.prefix}${e.latest}`, col.version));
  const pinnedTag = e.pinned ? pc.yellow('  pinned') : '';
  return ` ${name}${current} ${next}${pinnedTag}`;
}

// ─── Multiselect option builders ─────────────────────────────────────────────

/**
 * One row per outdated package (range-prefixed and pinned). Nothing is pre-selected; callers pass
 * `initialValues` (from each option's `initialValue`) into `multiselectLineBreak`.
 */
export function createOutdatedSelectOptions(
  entries: DepEntryWithLatest[],
): SelectOption<DepEntryWithLatest>[] {
  const filtered = entries.filter((e) => e.outdated);

  const col: ColWidths = {
    // Sized to the visible (filtered) rows so versions don't drift right to match
    // up-to-date packages. nameExtraPad is the tuning knob in TUI_DEFAULTS.multiselect.
    name: computeNameWidth(filtered, TUI_DEFAULTS.multiselect.nameExtraPad),
    // Version width matches the full table (all entries) for consistent alignment.
    version: computeVersionWidth(entries),
  };

  return filtered.map((e) => ({
    value: e,
    label: renderSelectLabel(e, col),
    hint: toProjectRelativePath(e.sourceFile),
    initialValue: false,
  }));
}
