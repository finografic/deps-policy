import { renderOutdatedGroup } from 'deps-cli/output/outdate.utils.js';
import { groupDependencies } from 'deps-cli/utils/groups.utils.js';
import pc from 'picocolors';
import type { DepEntryWithLatest } from '../types/dep-metadata.types.js';

import { FIRST_COLUMN_OFFSET, LEFT_MARGIN } from './config.constants.js';
import { computeColumnWidths } from './table/width.js';

export function printOutdated(entries: DepEntryWithLatest[]): void {
  if (entries.length === 0) {
    console.log(`${LEFT_MARGIN}${pc.dim('No dependencies found.')}`);
    return;
  }

  const outdated = entries.filter((e) => e.outdated);
  const total = entries.length;

  // ─── Summary ───────────────────────────────────────────────

  console.log();
  console.log(`${LEFT_MARGIN}${pc.bold(`${outdated.length} of ${total} packages outdated`)}`);

  // ─── Build rows (for width calculation) ────────────────────

  const rows = entries.map((e) => {
    const next = e.latest ? `${e.prefix}${e.latest}` : '';
    return [e.name, e.current, next];
  });

  const widths = computeColumnWidths(rows);

  const columns = [
    { width: widths[0] + FIRST_COLUMN_OFFSET, align: 'left' as const },
    { width: widths[1], align: 'right' as const },
    { width: widths[2], align: 'right' as const },
  ];

  // ─── Grouping ──────────────────────────────────────────────

  const groups = groupDependencies(entries);
  const dividerWidth = widths[0] + FIRST_COLUMN_OFFSET + widths[1] + widths[2] + 4;

  for (const group of groups) {
    const lines = renderOutdatedGroup(group, columns, dividerWidth);

    for (const line of lines) {
      console.log(line);
    }
  }

  console.log();
  console.log(`${LEFT_MARGIN}${pc.dim('Done.')}`);
}
