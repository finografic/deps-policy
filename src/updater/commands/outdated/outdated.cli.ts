import * as clack from '@clack/prompts';
import pc from 'picocolors';

import { collectDeps } from '../../collect-deps.js';
import { printOutdated } from '../../output/outdated.output.js';
import { resolveLatestVersions } from '../../resolve-latest.js';

export async function runOutdated(): Promise<void> {
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
