import pc from 'picocolors';
import { computeNameWidth, computeVersionWidth, padLeft, padRight } from 'tui/format.tui.js';
import { TUI_DEFAULTS } from 'tui/tui.config.js';

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
  return ` ${name}${current}  ${pc.dim('→')}${next}`;
}

// ─── Multiselect option builders ─────────────────────────────────────────────

export function createRangeSelectOptions(entries: DepEntryWithLatest[]): SelectOption<DepEntryWithLatest>[] {
  const filtered = entries.filter((e) => e.outdated && !e.pinned);

  const col: ColWidths = {
    // Sized to the visible (filtered) rows so versions don't drift right to match
    // up-to-date packages. nameExtraPad is the tuning knob in tui.config.ts.
    name: computeNameWidth(filtered, TUI_DEFAULTS.multiselect.nameExtraPad),
    // Version width matches the full table (all entries) for consistent alignment.
    version: computeVersionWidth(entries),
  };

  return filtered.map((e) => ({
    value: e,
    label: renderSelectLabel(e, col),
    hint: toProjectRelativePath(e.sourceFile),
    initialValue: true,
  }));
}
