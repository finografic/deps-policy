import * as clack from '@clack/prompts';
import { renderCommandHelp } from 'core/render-help/index.js';
import { collectDeps } from 'deps-cli/collect-deps.js';
import { printAudit } from 'deps-cli/output/audit.output.js';
import pc from 'picocolors';

import { auditDeps } from './audit.logic.js';

export async function runAudit(argv: string[] = []): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    renderCommandHelp({
      command: 'policy audit',
      description: 'Check policy packages against the OSV vulnerability database',
      usage: 'policy audit',
      examples: [
        { command: 'policy audit', description: 'Scan all policy packages for known vulnerabilities' },
      ],
    });
    return;
  }

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
