// core/group-deps.ts

import type { DepEntryWithLatest } from 'types/dep-metadata.types.js';

export interface DependencyGroup {
  name: string;
  entries: DepEntryWithLatest[];
}

export function groupDependencies(entries: DepEntryWithLatest[]): DependencyGroup[] {
  const map = new Map<string, DepEntryWithLatest[]>();

  for (const e of entries) {
    const key = e.group ?? 'other';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }

  return Array.from(map.entries()).map(([name, entries]) => ({
    name,
    entries,
  }));
}
