import { renderCommandHelp } from '@finografic/cli-kit/render-help';
import * as clack from '@clack/prompts';
import { collectDeps } from 'collect-deps.js';
import { LEFT_MARGIN } from 'deps-cli/config.constants.js';
import { printDepsTable } from 'deps-cli/output/deps.table.js';
import pc from 'picocolors';
import { resolveLatestVersions } from 'resolve-latest.js';

import { help } from './outdated.help.js';

export async function runOutdated(argv: string[] = []): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    renderCommandHelp(help);
    return;
  }

  clack.intro(pc.bold('deps-policy › outdated'));

  const spin = clack.spinner();
  spin.start('Collecting policy packages…');

  const deps = await collectDeps();
  spin.message(`Fetching latest from npm registry… (${deps.length} packages)`);

  const entries = await resolveLatestVersions(deps);
  spin.stop(`Fetched ${entries.length} packages`);

  if (entries.length === 0) {
    console.log(`${LEFT_MARGIN}${pc.dim('No dependencies found.')}`);
    return;
  }

  printDepsTable(entries);

  clack.outro('Done.');
}
