export interface AuditEntry {
  name: string;
  version: string;
  vulns: OsvVulnerability[];
}

export interface OsvVulnerability {
  id: string;
  summary?: string;
  severity?: Array<{ type: string; score: string }>;
  references?: Array<{ url: string }>;
}
