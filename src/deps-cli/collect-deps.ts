import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DependencyKind } from 'deps.types';

import type { DepEntry } from 'types/dep-metadata.types.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const POLICY_DIR = resolve(__dirname, '../policy');

const POLICY_FILES = [
  resolve(POLICY_DIR, 'base.deps.ts'),
  resolve(POLICY_DIR, 'cli.deps.ts'),
  resolve(POLICY_DIR, 'library.deps.ts'),
  resolve(POLICY_DIR, 'config.deps.ts'),
];

function parsePrefix(version: string): string {
  if (version.startsWith('^')) return '^';
  if (version.startsWith('~')) return '~';
  return '';
}

// Returns Map<groupName, Map<pkgName, version>>
function extractGroupBlocks(src: string): Map<string, Map<string, string>> {
  const groups = new Map<string, Map<string, string>>();
  const blockRe = /const\s+(\w+)\s*:\s*Record<string,\s*string>\s*=\s*\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(src)) !== null) {
    const pkgs = new Map<string, string>();
    // Match both quoted ('pkg': 'ver') and unquoted (pkg: 'ver') keys
    const lineRe = /(?:['"]([^'"]+)['"]|([a-z_$][\w$]*))\s*:\s*['"]([^'"]+)['"]/g;
    let p: RegExpExecArray | null;
    while ((p = lineRe.exec(m[2]!)) !== null) {
      pkgs.set(p[1] ?? p[2]!, p[3]!);
    }
    if (pkgs.size > 0) groups.set(m[1]!, pkgs);
  }
  return groups;
}

// Returns Map<groupName, DependencyKind> — derived from spreads inside depKind sections
function extractGroupKinds(src: string): Map<string, DependencyKind> {
  const kindMap = new Map<string, DependencyKind>();
  const sectionRe = /\b(dependencies|devDependencies|peerDependencies)\s*:\s*\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(src)) !== null) {
    const kind = m[1] as DependencyKind;
    const spreadRe = /\.\.\.([\w]+)/g;
    let s: RegExpExecArray | null;
    while ((s = spreadRe.exec(m[2]!)) !== null) {
      kindMap.set(s[1]!, kind);
    }
  }
  return kindMap;
}

// Returns inline deps declared directly inside a depKind section (not via a named group)
function extractInlineEntries(
  src: string,
  capturedNames: Set<string>,
  fallbackGroup: string,
): Array<{ name: string; version: string; depKind: DependencyKind }> {
  const inline: Array<{ name: string; version: string; depKind: DependencyKind }> = [];
  const sectionRe = /\b(dependencies|devDependencies|peerDependencies)\s*:\s*\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(src)) !== null) {
    const kind = m[1] as DependencyKind;
    const content = m[2]!;
    const lineRe = /^\s*(?:['"]([^'"]+)['"]|([a-z_$][\w$]*))\s*:\s*['"]([^'"]+)['"]/gm;
    let p: RegExpExecArray | null;
    while ((p = lineRe.exec(content)) !== null) {
      const name = p[1] ?? p[2]!;
      if (!capturedNames.has(name)) {
        inline.push({ name, version: p[3]!, depKind: kind });
      }
    }
  }
  // Suppress unused warning
  void fallbackGroup;
  return inline;
}

async function parseSourceFile(filePath: string): Promise<DepEntry[]> {
  const src = await readFile(filePath, 'utf8');
  const entries: DepEntry[] = [];
  const capturedNames = new Set<string>();

  const groupBlocks = extractGroupBlocks(src);
  const kindMap = extractGroupKinds(src);

  for (const [groupName, pkgs] of groupBlocks) {
    const depKind = kindMap.get(groupName) ?? 'devDependencies';
    for (const [name, version] of pkgs) {
      const prefix = parsePrefix(version);
      entries.push({
        name,
        current: version,
        prefix,
        bare: version.replace(/^[\^~]/, ''),
        group: groupName,
        sourceFile: filePath,
        depKind,
      });
      capturedNames.add(name);
    }
  }

  const stem = basename(filePath, '.ts');
  for (const { name, version, depKind } of extractInlineEntries(src, capturedNames, stem)) {
    const prefix = parsePrefix(version);
    entries.push({
      name,
      current: version,
      prefix,
      bare: version.replace(/^[\^~]/, ''),
      group: stem,
      sourceFile: filePath,
      depKind,
    });
  }

  return entries;
}

export async function collectDeps(): Promise<DepEntry[]> {
  const all: DepEntry[] = [];
  const seen = new Set<string>();

  for (const file of POLICY_FILES) {
    const entries = await parseSourceFile(file);
    for (const e of entries) {
      if (!seen.has(e.name)) {
        all.push(e);
        seen.add(e.name);
      }
    }
  }

  return all;
}
