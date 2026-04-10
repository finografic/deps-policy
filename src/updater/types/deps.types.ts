import type { DependencyKind } from '../../types.js';

export interface DepEntry {
  name: string;
  current: string;
  prefix: string;
  bare: string;
  group: string;
  sourceFile: string;
  depKind: DependencyKind;
}

export interface DepEntryWithLatest extends DepEntry {
  latest: string | null;
  outdated: boolean;
  pinned: boolean;
}
