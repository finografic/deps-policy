import * as clack from '@clack/prompts';
import pc from 'picocolors';
import type { DepEntryWithLatest } from '../../types/deps.types.js';

import { collectDeps } from '../../collect-deps.js';
import { printOutdated } from '../../output/outdated.output.js';
import { createRangeSelectOptions } from '../../prompts/select-packages.prompt.js';
import { resolveLatestVersions } from '../../resolve-latest.js';
import { toProjectRelativePath } from '../../utils/path.utils.js';
import { applyPatches } from './update.logic.js';

export async function runUpdate(): Promise<void> {
  clack.intro(pc.bold('deps-policy › update'));

  const spin = clack.spinner();
  spin.start('Collecting policy packages…');

  const deps = await collectDeps();
  spin.message(`Fetching latest from npm registry… (${deps.length} packages)`);

  const entries = await resolveLatestVersions(deps);
  const outdatedCount = entries.filter((e) => e.outdated).length;
  spin.stop(`${outdatedCount} of ${entries.length} packages outdated`);

  if (outdatedCount === 0) {
    clack.outro(pc.green('All packages are up to date.'));
    return;
  }

  printOutdated(entries);

  // ─ Batch: range-prefixed outdated packages ─────────────────────────────────

  const rangeOptions = createRangeSelectOptions(entries);
  const patches: Array<{ filePath: string; name: string; newVersion: string }> = [];

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

  if (patches.length === 0) {
    clack.outro('No changes applied.');
    return;
  }

  // ─ Apply patches ───────────────────────────────────────────────────────────

  const results = await applyPatches(patches);
  for (const { filePath, count } of results) {
    clack.log.success(
      `Patched ${toProjectRelativePath(filePath)} (${count} change${count === 1 ? '' : 's'})`,
    );
  }

  const names = patches.map((p) => p.name).join(', ');
  clack.outro(`Suggested commit: ${pc.dim(`deps: bump ${names}`)}`);
}
