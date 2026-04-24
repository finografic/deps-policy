import { renderCommandHelp } from '@finografic/cli-kit/render-help';
import type { ColumnDef } from '@finografic/cli-kit/tui/table';
import * as clack from '@clack/prompts';
import { collectDeps } from 'collect-deps.js';
import { CLACK_LEFT_MARGIN } from 'deps-cli/config.constants.js';
import { getDepsColumns } from 'deps-cli/output/deps.columns.js';
import { printDepsTable } from 'deps-cli/output/deps.table.js';
import pc from 'picocolors';
import { resolveLatestVersions } from 'resolve-latest.js';
import type { DepEntryWithLatest } from 'deps-cli/types/dep-metadata.types.js';

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
    console.log(`${CLACK_LEFT_MARGIN}${pc.dim('No dependencies found.')}`);
    return;
  }

  const columns: ColumnDef<DepEntryWithLatest>[] = getDepsColumns();
  printDepsTable(entries, columns);

  clack.outro('Done.');
}
