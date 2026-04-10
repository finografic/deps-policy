import * as clack from '@clack/prompts';
import pc from 'picocolors';

import { collectDeps } from '../../collect-deps.js';
import { printAudit } from '../../output/audit.output.js';
import { auditDeps } from './audit.logic.js';

export async function runAudit(): Promise<void> {
  clack.intro(pc.bold('deps-policy › audit'));

  const spin = clack.spinner();
  spin.start('Collecting policy packages…');

  const deps = await collectDeps();
  spin.message(`Querying OSV database… (${deps.length} packages)`);

  const results = await auditDeps(deps);
  spin.stop(`Checked ${results.length} packages`);

  printAudit(results);

  clack.outro('Done.');
}
