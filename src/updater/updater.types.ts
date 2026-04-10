export type DepKind = 'dependencies' | 'devDependencies' | 'peerDependencies';

export interface DepEntry {
  name: string;
  current: string;
  prefix: string;
  bare: string;
  group: string;
  sourceFile: string;
  depKind: DepKind;
}

export interface DepEntryWithLatest extends DepEntry {
  latest: string | null;
  outdated: boolean;
  pinned: boolean;
}

export interface OsvVulnerability {
  id: string;
  summary?: string;
  severity?: Array<{ type: string; score: string }>;
  references?: Array<{ url: string }>;
}

export interface AuditEntry {
  name: string;
  version: string;
  vulns: OsvVulnerability[];
}
