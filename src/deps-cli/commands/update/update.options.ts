import type { MultiselectOption } from '@finografic/cli-kit/tui';
import type { TableInstance } from '@finografic/cli-kit/tui/table';
import { printDepsRow } from 'deps-cli/output/deps.row.js';
import { toProjectRelativePath } from 'deps-cli/utils/path.utils.js';
import type { DepEntryWithLatest } from 'deps-cli/types/dep-metadata.types.js';

export function createDepsSelectOptions(
  entries: DepEntryWithLatest[],
  table: TableInstance<DepEntryWithLatest>,
  opts?: { isSelected?: (entry: DepEntryWithLatest) => boolean },
): MultiselectOption<DepEntryWithLatest>[] {
  return entries.map((entry) => ({
    value: entry,
    label: printDepsRow(entry, table.renderRow(entry)),
    hint: toProjectRelativePath(entry.sourceFile),
    initialValue: opts?.isSelected?.(entry) ?? false,
  }));
}
