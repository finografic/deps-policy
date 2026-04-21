// src/deps-cli/output/table/row.ts

import { padLeft, padRight } from './padding.js';

export type ColumnAlign = 'left' | 'right';

export interface Column {
  width: number;
  align: ColumnAlign;
}

export function renderRow(values: string[], columns: Column[]): string {
  return values
    .map((val, i) => {
      const col = columns[i];
      return col.align === 'right' ? padLeft(val, col.width) : padRight(val, col.width);
    })
    .join('  ');
}
