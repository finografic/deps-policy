import * as clack from '@clack/prompts';
import pc from 'picocolors';
import type { PatchInput } from './update.logic.js';
import type { DepEntryWithLatest } from 'deps-cli/types/deps.types.js';

import { createRangeSelectOptions } from './update.options.js';

export async function selectUpdatePatches(entries: DepEntryWithLatest[]): Promise<PatchInput[]> {
  const patches: PatchInput[] = [];

  // ─ Batch: range-prefixed outdated packages ─────────────────────────────────

  const rangeOptions = createRangeSelectOptions(entries);

  if (rangeOptions.length > 0) {
    const selected = await clack.multiselect<DepEntryWithLatest>({
      message: 'Select packages to update',
      options: rangeOptions,
      required: false,
    });

    if (clack.isCancel(selected)) {
      clack.cancel('Cancelled.');
      process.exit(0);
    }

    for (const entry of selected) {
      patches.push({
        filePath: entry.sourceFile,
        name: entry.name,
        newVersion: `${entry.prefix}${entry.latest!}`,
      });
    }
  }

  // ─ Individual: pinned outdated packages ────────────────────────────────────

  const pinnedOutdated = entries.filter((e) => e.outdated && e.pinned);

  for (const entry of pinnedOutdated) {
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
