import { column } from '@finografic/cli-kit/tui/table';
import type { ColumnDef } from '@finografic/cli-kit/tui/table';
import pc from 'picocolors';
import type { DepEntryWithLatest } from '../types/dep-metadata.types.js';

export function getDepsColumns(): Array<ColumnDef<DepEntryWithLatest>> {
  return [
    column<DepEntryWithLatest>('name', {
      align: 'left',
      padding: { right: 3 },
      get: (entry) => entry.name,
    }),

    column<DepEntryWithLatest>('current', {
      align: 'right',
      get: (entry) => entry.current,
      format: (v, entry) => (entry.outdated ? pc.white(v) : pc.dim(v)),
    }),

    column<DepEntryWithLatest>('next', {
      align: 'right',
      get: (entry) => `${entry.prefix}${entry.latest}`,
      format: (v, entry) => (entry.latest ? pc.green(v) : pc.dim('(private)')),
    }),
  ];
}
