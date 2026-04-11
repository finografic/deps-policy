import { basename } from 'node:path';
import pc from 'picocolors';
import type { DepEntryWithLatest } from '../types/deps.types.js';

import { computeNameWidth, computeVersionWidth, createDivider, padRight } from '../tui/format.tui.js';

// ─── Grouping ────────────────────────────────────────────────────────────────

interface GroupedFile {
  sourceFile: string;
  groups: Map<string, DepEntryWithLatest[]>;
}

function groupByFile(entries: DepEntryWithLatest[]): GroupedFile[] {
  const fileMap = new Map<string, Map<string, DepEntryWithLatest[]>>();
  for (const e of entries) {
    if (!fileMap.has(e.sourceFile)) fileMap.set(e.sourceFile, new Map());
    const groups = fileMap.get(e.sourceFile)!;
    if (!groups.has(e.group)) groups.set(e.group, []);
    groups.get(e.group)!.push(e);
  }
  return [...fileMap.entries()].map(([sourceFile, groups]) => ({ sourceFile, groups }));
}

// ─── Row renderer ─────────────────────────────────────────────────────────────

interface ColWidths {
  name: number;
  version: number;
}

function renderOutdatedEntry(e: DepEntryWithLatest, col: ColWidths): string {
  const name = padRight(e.name, col.name);

  if (e.latest === null) {
    return `  ${pc.dim(name)}${padRight(e.current, col.version)}  ${pc.dim('(private)')}`;
  }

  if (!e.outdated) {
    return `  ${pc.dim(name)}${pc.dim(padRight(e.current, col.version))}  ${pc.dim('✓')}`;
  }

  const next = `${e.prefix}${e.latest}`;
  const arrow = `${pc.dim(padRight(e.current, col.version))}  ${pc.dim('→')}  ${pc.green(padRight(next, col.version))}`;
  const tag = e.pinned ? pc.yellow('  ✦ pinned') : pc.yellow('  ✦');

  return `  ${pc.bold(name)}${arrow}${tag}`;
}

// ─── Public ───────────────────────────────────────────────────────────────────

export function printOutdated(entries: DepEntryWithLatest[]): void {
  const outdatedCount = entries.filter((e) => e.outdated).length;
  const skipped = entries.filter((e) => e.latest === null && !e.name.startsWith('@finografic/')).length;

  if (outdatedCount === 0) {
    console.log(`\n  ${pc.green('✓')} All ${entries.length} packages are up to date.\n`);
    return;
  }

  console.log(
    `\n  ${pc.yellow(`${outdatedCount} of ${entries.length} packages outdated`)}${skipped > 0 ? pc.dim(`  (${skipped} skipped)`) : ''}\n`,
  );

  const col: ColWidths = {
    name: computeNameWidth(entries),
    version: computeVersionWidth(entries),
  };
  const tableWidth = col.name + col.version * 2 + 10;

  for (const { sourceFile, groups } of groupByFile(entries)) {
    const hasOutdated = [...groups.values()].flat().some((e) => e.outdated);
    if (!hasOutdated) continue;

    console.log(`  ${pc.bold(pc.cyan(basename(sourceFile)))}\n`);

    for (const [groupName, groupEntries] of groups) {
      const groupHasOutdated = groupEntries.some((e) => e.outdated);
      if (!groupHasOutdated) continue;

      console.log(`    ${pc.dim(groupName)}`);
      console.log(createDivider(tableWidth));
      for (const e of groupEntries) {
        console.log(renderOutdatedEntry(e, col));
      }
      console.log();
    }
  }
}
