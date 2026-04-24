import { createTable } from '@finografic/cli-kit/tui/table';
import type { ColumnDef } from '@finografic/cli-kit/tui/table';
import { printDepsRow } from 'deps-cli/output/deps.row.js';
import { groupDependencies } from 'deps-cli/utils/groups.utils.js';
import pc from 'picocolors';
import type { DepEntryWithLatest } from 'deps-cli/types/dep-metadata.types.js';

import { CLACK_LEFT_MARGIN } from '../config.constants.js';

// ─── Group title + divider ────────────────────────────────

export function printGroupTitle(name: string, totalWidth: number): void {
  console.log(pc.cyan(`${CLACK_LEFT_MARGIN}${name}`));
  console.log(pc.dim(`${CLACK_LEFT_MARGIN}${'─'.repeat(totalWidth)}`));
}

// ─── Table ────────────────────────────────────────────────

export function printDepsTable(
  entries: DepEntryWithLatest[],
  columns: ColumnDef<DepEntryWithLatest>[],
): void {
  const table = createTable<DepEntryWithLatest>(entries, columns);
  const groups = groupDependencies(entries);

  for (const group of groups) {
    console.log();
    printGroupTitle(group.name, table.totalWidth);

    for (const entry of group.entries) {
      console.log(CLACK_LEFT_MARGIN + printDepsRow(entry, table.renderRow(entry)));
    }
  }
}
