import { createTable, renderSectionTitle } from '@finografic/cli-kit/tui';
import type { ColumnDef } from '@finografic/cli-kit/tui';
import { printDepsRow } from 'deps-cli/output/deps.row.js';
import { groupDependencies } from 'deps-cli/utils/groups.utils.js';
import type { DepEntryWithLatest } from 'deps-cli/types/dep-metadata.types.js';

import { CLACK_LEFT_MARGIN } from '../config.constants.js';

// ─── Table ────────────────────────────────────────────────

export function printDepsTable(
  entries: DepEntryWithLatest[],
  columns: Array<ColumnDef<DepEntryWithLatest>>,
): void {
  const table = createTable<DepEntryWithLatest>(entries, columns);
  const groups = groupDependencies(entries);

  for (const group of groups) {
    console.log();
    renderSectionTitle(group.name, table.totalWidth, { margin: CLACK_LEFT_MARGIN });

    for (const entry of group.entries) {
      console.log(CLACK_LEFT_MARGIN + printDepsRow(entry, table.renderRow(entry)));
    }
  }
}
