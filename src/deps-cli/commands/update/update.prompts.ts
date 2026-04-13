import * as clack from '@clack/prompts';
import pc from 'picocolors';
import { multiselectLineBreak } from 'tui/multiselect.tui.js';
import type { PatchInput } from './update.logic.js';

import type { DepEntryWithLatest } from 'types/dep-metadata.types.js';

import { createOutdatedSelectOptions } from './update.options.js';

export async function selectUpdatePatches(entries: DepEntryWithLatest[]): Promise<PatchInput[]> {
  const patches: PatchInput[] = [];

  const outdatedOptions = createOutdatedSelectOptions(entries);

  if (outdatedOptions.length === 0) {
    return patches;
  }

  const initialValues = outdatedOptions.filter((o) => o.initialValue).map((o) => o.value);

  const selected = await multiselectLineBreak<DepEntryWithLatest>({
    message: 'Select packages to update',
    options: outdatedOptions,
    initialValues,
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
