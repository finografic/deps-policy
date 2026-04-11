import type { OsvVulnerability } from '../../types/audit.types.js';
import type { AuditEntry } from '../../types/audit.types.js';
import type { DepEntry } from '../../types/deps.types.js';

import { OSV_BATCH_URL } from './audit.constants.js';
import { BATCH_SIZE } from './audit.constants.js';

interface OsvQuery {
  package: { name: string; ecosystem: 'npm' };
  version: string;
}

interface OsvBatchResponse {
  results: Array<{ vulns?: OsvVulnerability[] }>;
}

async function queryOsvBatch(queries: OsvQuery[]): Promise<Array<OsvVulnerability[]>> {
  const res = await fetch(OSV_BATCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ queries }),
  });
  if (!res.ok) throw new Error(`OSV API error: ${res.status}`);
  const data = (await res.json()) as OsvBatchResponse;
  return data.results.map((r) => r.vulns ?? []);
}

export async function auditDeps(entries: DepEntry[]): Promise<AuditEntry[]> {
  // Skip private packages (no public vuln data for them)
  const auditable = entries.filter((e) => !e.name.startsWith('@finografic/'));
  const results: AuditEntry[] = [];

  for (let i = 0; i < auditable.length; i += BATCH_SIZE) {
    const batch = auditable.slice(i, i + BATCH_SIZE);
    const queries: OsvQuery[] = batch.map((e) => ({
      package: { name: e.name, ecosystem: 'npm' },
      version: e.bare,
    }));

    const vulnSets = await queryOsvBatch(queries);
    for (let j = 0; j < batch.length; j++) {
      results.push({ name: batch[j]!.name, version: batch[j]!.bare, vulns: vulnSets[j] ?? [] });
    }
  }

  return results;
}
