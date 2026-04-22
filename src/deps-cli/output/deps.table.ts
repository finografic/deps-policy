import type { TableInstance } from '@finografic/cli-kit/tui/table';
import { createTable } from '@finografic/cli-kit/tui/table';
import { printDepsLine } from 'deps-cli/output/deps.row.js';
import { groupDependencies } from 'deps-cli/utils/groups.utils.js';
import pc from 'picocolors';
import type { DepEntryWithLatest } from 'deps-cli/types/dep-metadata.types.js';

import { LEFT_MARGIN } from '../config.constants.js';
import { getDepsColumns } from './deps.columns.js';

// ─── Title ────────────────────────────────────────────────

export function printGroupTitle<T extends { name: string }>(
  group: T,
  table: TableInstance<DepEntryWithLatest>,
): void {
  const dividerWidth =
    table.columns.reduce((acc, col) => acc + col.width, 0) + (table.columns.length - 1) * 2;

  const title = `${LEFT_MARGIN}${group.name}`;
  const divider = pc.dim(`${LEFT_MARGIN}${'─'.repeat(dividerWidth)}`);

  console.log(pc.cyan(title));
  console.log(pc.cyan(divider));
}

// ─── Table ────────────────────────────────────────────────

export function printOutdatedTable(entries: DepEntryWithLatest[]): void {
  const outdated = entries.filter((entry) => entry.outdated);
  const total = entries.length;

  console.log();
  console.log(`${LEFT_MARGIN}${pc.bold(`${outdated.length} of ${total} packages outdated`)}`);

  const table = createTable(entries, getDepsColumns());
  const groups = groupDependencies(entries);

  for (const group of groups) {
    console.log();
    printGroupTitle(group, table);

    for (const entry of group.entries) {
      const line = printDepsLine(entry, table);
      console.log(LEFT_MARGIN + line);
    }
  }
}
