import { createTable, multiselectLineBreak } from '@finografic/cli-kit/tui';
import type { ColumnDef } from '@finografic/cli-kit/tui/table';
import * as clack from '@clack/prompts';
import pc from 'picocolors';
import type { PatchInput } from './update.logic.js';

import type { DepEntryWithLatest } from 'types/dep-metadata.types.js';

import { CLACK_MULTISELECT_PREFIX_WIDTH } from '../../config.constants.js';
import { createDepsSelectOptions } from './update.options.js';

export async function selectUpdatePatches(
  entries: DepEntryWithLatest[],
  columns: ColumnDef<DepEntryWithLatest>[],
): Promise<PatchInput[]> {
  const patches: PatchInput[] = [];

  // Clack's guide bar + checkbox prefix adds CLACK_MULTISELECT_PREFIX_WIDTH more chars than
  // CLACK_LEFT_MARGIN. Narrow the first column by that amount so version columns stay aligned
  // with the static table printed above the prompt.
  const msColumns = columns.map((col, i) =>
    i === 0
      ? {
          ...col,
          padding: {
            ...(col.padding ?? {}),
            right: (col.padding?.right ?? 0) - CLACK_MULTISELECT_PREFIX_WIDTH,
          },
        }
      : col,
  );
  const table = createTable<DepEntryWithLatest>(entries, msColumns);
  const options = createDepsSelectOptions(entries, table, { isSelected: (e) => !e.pinned });

  const selected = await multiselectLineBreak({
    message: 'Select packages to update\n',
    options,
    required: false,
  });

  if (clack.isCancel(selected)) {
    clack.cancel('Cancelled.');
    process.exit(0);
  }

  for (const entry of selected) {
    if (!entry.pinned) {
      patches.push({
        filePath: entry.sourceFile,
        name: entry.name,
        newVersion: `${entry.prefix}${entry.latest!}`,
      });
      continue;
    }

    const choice = await clack.select<string>({
      message: `${pc.bold(entry.name)} is pinned at ${pc.dim(entry.bare)} — latest is ${pc.green(entry.latest!)}. Update?`,
      options: [
        { value: 'skip', label: `No, keep at ${entry.bare}` },
        { value: 'pin', label: `Pin to ${entry.latest}` },
        { value: 'range', label: `Add range prefix (^${entry.latest})` },
      ],
      initialValue: 'skip',
    });

    if (clack.isCancel(choice)) {
      clack.cancel('Cancelled.');
      process.exit(0);
    }

    if (choice === 'pin') {
      patches.push({ filePath: entry.sourceFile, name: entry.name, newVersion: entry.latest! });
    } else if (choice === 'range') {
      patches.push({
        filePath: entry.sourceFile,
        name: entry.name,
        newVersion: `^${entry.latest!}`,
      });
    }
  }

  return patches;
}
