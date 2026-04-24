import type { SelectOption } from '@finografic/cli-kit/prompts';
import { createTable } from '@finografic/cli-kit/tui/table';
import type { TableInstance } from '@finografic/cli-kit/tui/table';
import { getDepsColumns } from 'deps-cli/output/deps.columns.js';
import { printDepsLine } from 'deps-cli/output/deps.row.js';
import { toProjectRelativePath } from 'deps-cli/utils/path.utils.js';
import type { DepEntryWithLatest } from 'deps-cli/types/dep-metadata.types.js';

// ─── Labels ────────────────────────────────────────────────

function createSelectLabels(
  entries: DepEntryWithLatest[],
  table: TableInstance<DepEntryWithLatest>,
): string[] {
  return entries.map((entry) => printDepsLine(entry, table));
}

// ─── Options ───────────────────────────────────────────────

export function createSelectOptions(
  entries: DepEntryWithLatest[],
  options?: {
    isSelected?: (entry: DepEntryWithLatest) => boolean;
  },
  table?: TableInstance<DepEntryWithLatest>,
): SelectOption<DepEntryWithLatest>[] {
  if (entries.length === 0) return [];

  const tableInstance = table ?? createTable(entries, getDepsColumns());

  const labels = createSelectLabels(entries, tableInstance);

  const isSelected = options?.isSelected ?? (() => false);

  return entries.map((entry, i) => ({
    value: entry,
    label: labels[i],
    hint: toProjectRelativePath(entry.sourceFile),
    initialValue: isSelected(entry),
  }));
}
