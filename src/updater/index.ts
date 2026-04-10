import * as clack from '@clack/prompts';
import pc from 'picocolors';
import type { DepEntryWithLatest } from './updater.types.js';

import { auditDeps } from './audit.js';
import { collectDeps, relPath } from './collect.js';
import { buildRangeSelectOptions, displayAudit, displayOutdated } from './display.js';
import { fetchLatestVersions } from './fetch.js';
import { applyPatches } from './patch.js';

// Load .env (NPM_TOKEN for GitHub Packages auth)
try {
  process.loadEnvFile('.env');
} catch {
  // .env not present — continue with existing env vars
}

// ─── outdated ─────────────────────────────────────────────────────────────────

async function runOutdated(): Promise<void> {
  clack.intro(pc.bold('deps-policy › outdated'));

  const spin = clack.spinner();
  spin.start('Collecting policy packages…');
  const deps = await collectDeps();
  spin.message(`Fetching latest from npm registry… (${deps.length} packages)`);
  const entries = await fetchLatestVersions(deps);
  spin.stop(`Fetched ${entries.length} packages`);

  displayOutdated(entries);
  clack.outro('Done.');
}

// ─── update ───────────────────────────────────────────────────────────────────

async function runUpdate(): Promise<void> {
  clack.intro(pc.bold('deps-policy › update'));

  const spin = clack.spinner();
  spin.start('Collecting policy packages…');
  const deps = await collectDeps();
  spin.message(`Fetching latest from npm registry… (${deps.length} packages)`);
  const entries = await fetchLatestVersions(deps);
  const outdatedCount = entries.filter((e) => e.outdated).length;
  spin.stop(`${outdatedCount} of ${entries.length} packages outdated`);

  if (outdatedCount === 0) {
    clack.outro(pc.green('All packages are up to date.'));
    return;
  }

  displayOutdated(entries);

  // ─ Batch: range-prefixed outdated packages ─────────────────────────────────
  const rangeOptions = buildRangeSelectOptions(entries);
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
      patches.push({ filePath: entry.sourceFile, name: entry.name, newVersion: `^${entry.latest!}` });
    }
  }

  if (patches.length === 0) {
    clack.outro('No changes applied.');
    return;
  }

  // ─ Apply patches ───────────────────────────────────────────────────────────
  const results = await applyPatches(patches);
  for (const { filePath, count } of results) {
    clack.log.success(`Patched ${relPath(filePath)} (${count} change${count === 1 ? '' : 's'})`);
  }

  const names = patches.map((p) => p.name).join(', ');
  clack.outro(`Suggested commit: ${pc.dim(`deps: bump ${names}`)}`);
}

// ─── audit ────────────────────────────────────────────────────────────────────

async function runAudit(): Promise<void> {
  clack.intro(pc.bold('deps-policy › audit'));

  const spin = clack.spinner();
  spin.start('Collecting policy packages…');
  const deps = await collectDeps();
  spin.message(`Querying OSV database… (${deps.length} packages)`);
  const results = await auditDeps(deps);
  spin.stop(`Checked ${results.length} packages`);

  displayAudit(results);
  clack.outro('Done.');
}

// ─── entry ────────────────────────────────────────────────────────────────────

const command = process.argv[2];

switch (command) {
  case 'outdated':
    await runOutdated();
    break;
  case 'update':
    await runUpdate();
    break;
  case 'audit':
    await runAudit();
    break;
  default:
    console.error(`Usage: policy:outdated | policy:update | policy:audit`);
    process.exit(1);
}
