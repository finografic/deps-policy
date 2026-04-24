import { multiselectLineBreak } from '@finografic/cli-kit/tui';
import { createTable } from '@finografic/cli-kit/tui/table';
import * as clack from '@clack/prompts';
import { getDepsColumns } from 'deps-cli/output/deps.columns.js';
import pc from 'picocolors';
import type { PatchInput } from './update.logic.js';

import type { DepEntryWithLatest } from 'types/dep-metadata.types.js';

import { createSelectOptions } from './update.options.js';

// ─────────────────────────────────────────────────────────────

export async function selectUpdatePatches(entries: DepEntryWithLatest[]): Promise<PatchInput[]> {
  const patches: PatchInput[] = [];

  // ✅ 1. FILTER FIRST (critical)
  const actionable = entries.filter((e) => e.outdated);

  if (actionable.length === 0) {
    return patches;
  }

  // ✅ 2. CREATE ONE SHARED TABLE (critical for alignment)
  const table = createTable(actionable, getDepsColumns(), { prefixWidth: 1 });

  // ✅ 3. CREATE OPTIONS USING SAME TABLE
  const options = createSelectOptions(
    actionable,
    { isSelected: (e) => !e.pinned },
    table, // 👈 THIS fixes column drift
  );

  // ✅ 4. PROMPT
  const selected = await multiselectLineBreak<DepEntryWithLatest>({
    message: 'Select packages to update',
    options,
    required: false,
  });

  // ✅ 5. HANDLE CANCEL
  if (clack.isCancel(selected)) {
    clack.cancel('Cancelled.');
    process.exit(0);
  }

  // (rest of your logic unchanged)

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
