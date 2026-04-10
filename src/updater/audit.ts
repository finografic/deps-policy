import type { AuditEntry, DepEntry, OsvVulnerability } from './updater.types.js';

const OSV_BATCH_URL = 'https://api.osv.dev/v1/querybatch';
const BATCH_SIZE = 50; // OSV supports up to 1000 queries per batch

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

export function severityRank(vuln: OsvVulnerability): number {
  const scoreStr = vuln.severity?.find((s) => s.type === 'CVSS_V3')?.score ?? '';
  const score = parseFloat(scoreStr.split('/')[0]?.replace(/[^0-9.]/g, '') ?? '0');
  if (score >= 9) return 4; // critical
  if (score >= 7) return 3; // high
  if (score >= 4) return 2; // moderate
  return 1; // low
}

export function severityLabel(rank: number): string {
  return ['', 'low', 'moderate', 'high', 'critical'][rank] ?? 'low';
}
