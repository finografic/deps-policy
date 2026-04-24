import { createTable } from '@finografic/cli-kit/tui/table';
import type { TableInstance } from '@finografic/cli-kit/tui/table';
import { groupDependencies } from 'deps-cli/utils/groups.utils.js';
import pc from 'picocolors';
import type { DepEntryWithLatest } from 'deps-cli/types/dep-metadata.types.js';

import { CLACK_LEFT_MARGIN } from '../config.constants.js';
import { getDepsColumns } from './deps.columns.js';
import { printDepsLine } from './deps.row.js';

// ─── Group title + divider ────────────────────────────────

export function printGroupTitle(name: string, table: TableInstance<DepEntryWithLatest>): void {
  console.log(pc.cyan(`${CLACK_LEFT_MARGIN}${name}`));
  console.log(pc.dim(`${CLACK_LEFT_MARGIN}${'─'.repeat(table.totalWidth)}`));
}

// ─── Table ────────────────────────────────────────────────

export function printDepsTable(
  entries: DepEntryWithLatest[],
  options?: { view?: 'all' | 'outdated' },
): TableInstance<DepEntryWithLatest> {
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

  const table = createTable(visibleEntries, getDepsColumns());
  const groups = groupDependencies(visibleEntries);

  for (const group of groups) {
    console.log();
    printGroupTitle(group.name, table);

    for (const entry of group.entries) {
      console.log(CLACK_LEFT_MARGIN + printDepsLine(entry, table));
    }
  }

  return table;
}
