import { renderCommandHelp } from '@finografic/cli-kit/render-help';
import * as clack from '@clack/prompts';
import { collectDeps } from 'collect-deps.js';
import { printAudit } from 'output/audit.output.js';
import pc from 'picocolors';

import { help } from './audit.help.js';
import { auditDeps } from './audit.logic.js';

export async function runAudit(argv: string[] = []): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    renderCommandHelp(help);
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
