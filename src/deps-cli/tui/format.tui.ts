import pc from 'picocolors';
import type { DepEntryWithLatest } from 'deps-cli/types/deps.types.js';

import { TUI_DEFAULTS } from './tui.config.js';

// ─── Primitives ──────────────────────────────────────────────────────────────

export function padRight(value: string, width: number): string {
  return value + ' '.repeat(Math.max(2, width - value.length));
}

export function createDivider(width: number): string {
  return pc.dim('  ' + '─'.repeat(width));
}

// ─── Column width computation ─────────────────────────────────────────────────

/**
 * Compute the name column width from live data, floored at TUI_DEFAULTS.name.min.
 */
export function computeNameWidth(entries: DepEntryWithLatest[]): number {
  if (entries.length === 0) return TUI_DEFAULTS.name.min;
  const max = Math.max(...entries.map((e) => e.name.length));
  return Math.max(TUI_DEFAULTS.name.min, max) + 2;
}

/**
 * Compute the version column width from live data, floored at TUI_DEFAULTS.version.min.
 */
export function computeVersionWidth(entries: DepEntryWithLatest[]): number {
  if (entries.length === 0) return TUI_DEFAULTS.version.min;
  const max = Math.max(
    ...entries.flatMap((e) => [e.current.length, e.latest != null ? `${e.prefix}${e.latest}`.length : 0]),
  );
  return Math.max(TUI_DEFAULTS.version.min, max) + 1;
}
