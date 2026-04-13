import * as clack from '@clack/prompts';
import { collectDeps } from 'collect-deps.js';
import { renderCommandHelp } from 'core/render-help/index.js';
import { printOutdated } from 'output/outdated.output.js';
import pc from 'picocolors';
import { resolveLatestVersions } from 'resolve-latest.js';

import { toProjectRelativePath } from 'utils/path.utils.js';

import { help } from './update.help.js';
import { applyPatches } from './update.logic.js';
import { selectUpdatePatches } from './update.prompts.js';

export async function runUpdate(argv: string[] = []): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    renderCommandHelp(help);
    return;
  }

  clack.intro(pc.bold('deps-policy › update'));

  const spin = clack.spinner();
  spin.start('Collecting policy packages…');

  const deps = await collectDeps();
  spin.message(`Fetching latest from npm registry… (${deps.length} packages)`);

  const entries = await resolveLatestVersions(deps);
  const outdatedCount = entries.filter((e) => e.outdated).length;
  spin.stop(`${outdatedCount} of ${entries.length} packages outdated`);

  if (outdatedCount === 0) {
    clack.outro(pc.green('All packages are up to date.'));
    return;
  }

  printOutdated(entries);

  const patches = await selectUpdatePatches(entries);

  if (patches.length === 0) {
    clack.outro('No changes applied.');
    return;
  }

  const results = await applyPatches(patches);
  for (const { filePath, count } of results) {
    clack.log.success(
      `Patched ${toProjectRelativePath(filePath)} (${count} change${count === 1 ? '' : 's'})`,
    );
  }

  const names = patches.map((p) => p.name).join(', ');
  clack.outro(`Suggested commit: ${pc.dim(`deps: bump ${names}`)}`);
}
