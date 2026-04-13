import type { OsvVulnerability } from 'types/audit.types.js';

export function severityRank(vuln: OsvVulnerability): number {
  const scoreStr = vuln.severity?.find((s) => s.type === 'CVSS_V3')?.score ?? '';
  const score = parseFloat(scoreStr.split('/')[0]?.replace(/[^0-9.]/g, '') ?? '0');
  if (score >= 9) return 4; // critical
  if (score >= 7) return 3; // high
  if (score >= 4) return 2; // moderate
  return 1; // low
}

// TODO: move to a constants file ??
export function severityLabel(rank: number): string {
  return ['', 'low', 'moderate', 'high', 'critical'][rank] ?? 'low';
}
