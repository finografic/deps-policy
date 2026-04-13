import pc from 'picocolors';

import { severityLabel, severityRank } from 'utils/audit.utils.js';

import type { AuditEntry } from 'types/audit.types.js';

const SEVERITY_COLORS: Record<string, (s: string) => string> = {
  critical: pc.red,
  high: pc.yellow,
  moderate: pc.cyan,
  low: pc.dim,
};

export function printAudit(results: AuditEntry[]): void {
  const vulnerable = results.filter((r) => r.vulns.length > 0);

  if (vulnerable.length === 0) {
    console.log(`\n  ${pc.green('✓')} No known vulnerabilities in ${results.length} packages.\n`);
    return;
  }

  // Sort: highest severity first, then alphabetical
  const sorted = vulnerable.sort((a, b) => {
    const aMax = Math.max(...a.vulns.map(severityRank));
    const bMax = Math.max(...b.vulns.map(severityRank));
    return bMax - aMax || a.name.localeCompare(b.name);
  });

  console.log(`\n  ${pc.red(`${vulnerable.length} package(s) with known vulnerabilities`)}\n`);

  for (const { name, version, vulns } of sorted) {
    const maxRank = Math.max(...vulns.map(severityRank));
    const label = severityLabel(maxRank);
    const colorFn = SEVERITY_COLORS[label] ?? pc.dim;
    console.log(`  ${pc.bold(name)} ${pc.dim(`@${version}`)}  ${colorFn(`[${label}]`)}`);

    for (const v of vulns) {
      const ref = v.references?.[0]?.url ?? '';
      console.log(`    ${pc.dim('·')} ${v.id}${v.summary ? `  ${pc.dim(v.summary)}` : ''}`);
      if (ref) console.log(`      ${pc.dim(ref)}`);
    }
    console.log();
  }
}
