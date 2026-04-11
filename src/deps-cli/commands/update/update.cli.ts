import * as clack from '@clack/prompts';
import { renderCommandHelp } from 'core/render-help/index.js';
import { collectDeps } from 'deps-cli/collect-deps.js';
import { printOutdated } from 'deps-cli/output/outdated.output.js';
import { resolveLatestVersions } from 'deps-cli/resolve-latest.js';
import { toProjectRelativePath } from 'deps-cli/utils/path.utils.js';
import pc from 'picocolors';

import { applyPatches } from './update.logic.js';
import { selectUpdatePatches } from './update.prompts.js';

export async function runUpdate(argv: string[] = []): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    renderCommandHelp({
      command: 'policy update',
      description: 'Interactively update outdated packages in policy files',
      usage: 'policy update',
      examples: [{ command: 'policy update', description: 'Review and apply updates interactively' }],
      howItWorks: [
        'Collects all packages from policy source files (base.ts, cli.ts, library.ts, config.ts)',
        'Fetches the latest version of each package from the npm registry',
        'Shows a table of outdated packages',
        'Prompts to select range-prefixed packages to bump (multi-select)',
        'Prompts individually for pinned packages: skip / pin to latest / add range prefix',
        'Patches the version strings in the source files',
      ],
    });
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
