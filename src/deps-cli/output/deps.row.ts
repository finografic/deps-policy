import pc from 'picocolors';
import type { DepEntryWithLatest } from '../types/dep-metadata.types.js';

export function printDepsRow(entry: DepEntryWithLatest, baseRow: string): string {
  const tag = entry.pinned ? pc.yellow('  ✦ pinned') : entry.outdated ? pc.yellow('  ✦') : '';
  const styled = entry.outdated ? pc.bold(baseRow) : pc.dim(baseRow);
  return styled + tag;
}
