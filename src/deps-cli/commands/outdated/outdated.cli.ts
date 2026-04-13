import * as clack from '@clack/prompts';
import { collectDeps } from 'collect-deps.js';
import { renderCommandHelp } from 'core/render-help/index.js';
import { printOutdated } from 'output/outdated.output.js';
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

  printOutdated(entries);

  clack.outro('Done.');
}
