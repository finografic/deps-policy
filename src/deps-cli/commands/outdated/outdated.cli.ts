import * as clack from '@clack/prompts';
import { renderCommandHelp } from 'core/render-help/index.js';
import { collectDeps } from 'deps-cli/collect-deps.js';
import { printOutdated } from 'deps-cli/output/outdated.output.js';
import { resolveLatestVersions } from 'deps-cli/resolve-latest.js';
import pc from 'picocolors';

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
