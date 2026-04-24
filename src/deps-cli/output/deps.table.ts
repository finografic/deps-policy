import type { TableInstance } from '@finografic/cli-kit/tui/table';
import { createTable } from '@finografic/cli-kit/tui/table';
import { printDepsLine } from 'deps-cli/output/deps.row.js';
import { groupDependencies } from 'deps-cli/utils/groups.utils.js';
import pc from 'picocolors';
import type { DepEntryWithLatest } from 'deps-cli/types/dep-metadata.types.js';

import { CLACK_LEFT_MARGIN } from '../config.constants.js';
import { getDepsColumns } from './deps.columns.js';

// ─── Title ────────────────────────────────────────────────

export function printGroupTitle<T extends { name: string }>(
  group: T,
  table: TableInstance<DepEntryWithLatest>,
): void {
  const dividerWidth =
    table.columns.reduce((acc, col) => acc + col.width, 0) + (table.columns.length - 1) * 2;

  const title = `${CLACK_LEFT_MARGIN}${group.name}`;
  const divider = pc.dim(`${CLACK_LEFT_MARGIN}${'─'.repeat(dividerWidth)}`);

  console.log(pc.cyan(title));
  console.log(pc.cyan(divider));
}

// ─── Table ────────────────────────────────────────────────

export function printDepsTable(
  entries: DepEntryWithLatest[],
  options?: {
    view?: 'all' | 'outdated';
  },
): void {
  const view = options?.view ?? 'all';

  const total = entries.length;
  const outdatedCount = entries.filter((e) => e.outdated).length;

  const visibleEntries = view === 'outdated' ? entries.filter((e) => e.outdated) : entries;

  console.log();

  if (view === 'outdated') {
    console.log(`${CLACK_LEFT_MARGIN}${pc.bold(`${visibleEntries.length} outdated packages`)}`);
  } else {
    console.log(`${CLACK_LEFT_MARGIN}${pc.bold(`${outdatedCount} of ${total} packages outdated`)}`);
  }

  // Important: table + groups use SAME filtered set
  const table = createTable(visibleEntries, getDepsColumns());
  const groups = groupDependencies(visibleEntries);

  for (const group of groups) {
    console.log();
    printGroupTitle(group, table);

    for (const entry of group.entries) {
      const line = printDepsLine(entry, table);
      console.log(CLACK_LEFT_MARGIN + line);
    }
  }
}
