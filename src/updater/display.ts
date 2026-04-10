import { basename } from 'node:path';
import pc from 'picocolors';
import type { AuditEntry, DepEntryWithLatest } from './updater.types.js';

import { severityLabel, severityRank } from './audit.js';
import { relPath } from './collect.js';

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

// ─── Table rendering ─────────────────────────────────────────────────────────

const COL_NAME = 32;
const COL_VER = 12;

function padEnd(str: string, len: number): string {
  return str + ' '.repeat(Math.max(2, len - str.length));
}

function renderEntry(e: DepEntryWithLatest): string {
  const name = padEnd(e.name, COL_NAME);

  if (e.latest === null) {
    return `  ${pc.dim(name)}${padEnd(e.current, COL_VER)}  ${pc.dim('(private)')}`;
  }

  if (!e.outdated) {
    return `  ${pc.dim(name)}${pc.dim(padEnd(e.current, COL_VER))}  ${pc.dim('✓')}`;
  }

  const newVersion = `${e.prefix}${e.latest}`;
  const arrow = `${pc.dim(padEnd(e.current, COL_VER))}  ${pc.dim('→')}  ${pc.green(padEnd(newVersion, COL_VER))}`;
  const tag = e.pinned ? pc.yellow('  ✦ pinned') : pc.yellow('  ✦');
  return `  ${pc.bold(name)}${arrow}${tag}`;
}

export function displayOutdated(entries: DepEntryWithLatest[]): void {
  const outdatedCount = entries.filter((e) => e.outdated).length;
  const skipped = entries.filter((e) => e.latest === null && !e.name.startsWith('@finografic/')).length;

  if (outdatedCount === 0) {
    console.log(`\n  ${pc.green('✓')} All ${entries.length} packages are up to date.\n`);
    return;
  }

  console.log(
    `\n  ${pc.yellow(`${outdatedCount} of ${entries.length} packages outdated`)}${skipped > 0 ? pc.dim(`  (${skipped} skipped)`) : ''}\n`,
  );

  const divider = pc.dim('  ' + '─'.repeat(COL_NAME + COL_VER * 2 + 10));

  for (const { sourceFile, groups } of groupByFile(entries)) {
    const hasOutdated = [...groups.values()].flat().some((e) => e.outdated);
    if (!hasOutdated) continue;

    console.log(`  ${pc.bold(pc.cyan(basename(sourceFile)))}\n`);

    for (const [groupName, groupEntries] of groups) {
      const groupHasOutdated = groupEntries.some((e) => e.outdated);
      if (!groupHasOutdated) continue;

      console.log(`    ${pc.dim(groupName)}`);
      console.log(divider);
      for (const e of groupEntries) {
        console.log(renderEntry(e));
      }
      console.log();
    }
  }
}

// ─── Audit rendering ─────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, (s: string) => string> = {
  critical: pc.red,
  high: pc.yellow,
  moderate: pc.cyan,
  low: pc.dim,
};

export function displayAudit(results: AuditEntry[]): void {
  const vulnerable = results.filter((r) => r.vulns.length > 0);

  if (vulnerable.length === 0) {
    console.log(`\n  ${pc.green('✓')} No known vulnerabilities in ${results.length} packages.\n`);
    return;
  }

  // Sort: highest severity first, then alphabetical
  const sorted = vulnerable.sort((a, b) => {
    const aMax = Math.max(...a.vulns.map(severityRank));
    const bMax = Math.max(...b.vulns.map(severityRank));
    return bMax - aMax || a.name.localeCompare(b.name);
  });

  console.log(`\n  ${pc.red(`${vulnerable.length} package(s) with known vulnerabilities`)}\n`);

  for (const { name, version, vulns } of sorted) {
    const maxRank = Math.max(...vulns.map(severityRank));
    const label = severityLabel(maxRank);
    const colorFn = SEVERITY_COLORS[label] ?? pc.dim;
    console.log(`  ${pc.bold(name)} ${pc.dim(`@${version}`)}  ${colorFn(`[${label}]`)}`);

    for (const v of vulns) {
      const ref = v.references?.[0]?.url ?? '';
      console.log(`    ${pc.dim('·')} ${v.id}${v.summary ? `  ${pc.dim(v.summary)}` : ''}`);
      if (ref) console.log(`      ${pc.dim(ref)}`);
    }
    console.log();
  }
}

// ─── Multiselect option builders ─────────────────────────────────────────────

export interface SelectOption<T> {
  value: T;
  label: string;
  hint: string;
  initialValue: boolean;
}

export function buildRangeSelectOptions(entries: DepEntryWithLatest[]): SelectOption<DepEntryWithLatest>[] {
  return entries
    .filter((e) => e.outdated && !e.pinned)
    .map((e) => ({
      value: e,
      label: `${padEnd(e.name, COL_NAME)} ${pc.dim(e.current)} → ${pc.green(`${e.prefix}${e.latest}`)}`,
      hint: relPath(e.sourceFile),
      initialValue: true,
    }));
}
