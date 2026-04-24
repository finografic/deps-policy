import { resolve } from 'node:path';
import process from 'node:process';
import { runPnpmInstall } from '@finografic/cli-kit/package-manager';
import { withHelp } from '@finografic/cli-kit/render-help';
import * as clack from '@clack/prompts';
import { collectDeps } from 'collect-deps.js';
import { getDepsColumns } from 'deps-cli/output/deps.columns.js';
import { printDepsTable } from 'deps-cli/output/deps.table.js';
import pc from 'picocolors';
import { resolveLatestVersions } from 'resolve-latest.js';

import { toProjectRelativePath } from 'utils/path.utils.js';

import { help } from './update.help.js';
import { applyPatches, getApplicablePatchesForPackageJson } from './update.logic.js';
import { selectUpdatePatches } from './update.prompts.js';

export async function runUpdate(argv: string[] = []): Promise<void> {
  return withHelp(argv, help, async () => {
    clack.intro(pc.bold('deps-policy › update'));

    const spin = clack.spinner();
    spin.start('Collecting policy packages…');

    const deps = await collectDeps();
    spin.message(`Fetching latest from npm registry… (${deps.length} packages)`);

    const data = await resolveLatestVersions(deps);
    const entries = data.filter((dep) => dep.outdated);

    spin.stop(`${entries.length} of ${data.length} packages outdated`);

    if (entries.length === 0) {
      clack.outro(pc.green('All packages are up to date.'));
      return;
    }

    const columns = getDepsColumns();

    printDepsTable(entries, columns);
    console.log();

    const patches = await selectUpdatePatches(entries, columns);

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

    const packageJsonPath = resolve(process.cwd(), 'package.json');
    const pkgApplicable = await getApplicablePatchesForPackageJson(packageJsonPath, patches);

    if (pkgApplicable.length > 0) {
      const thisProjectName = `@finografic/deps-policy/${pc.bold('package.json')}`;
      const syncPkg = await clack.confirm({
        message: pc.cyan(
          `Apply the same ${pc.bold(pkgApplicable.length)} version bump${pkgApplicable.length === 1 ? '' : 's'} to ${pc.white(`${thisProjectName}?`)}`,
        ),
        initialValue: true,
      });

      if (clack.isCancel(syncPkg)) {
        clack.cancel('Cancelled.');
        process.exit(0);
      }

      if (syncPkg) {
        const pkgPatches = pkgApplicable.map((p) => ({
          filePath: packageJsonPath,
          name: p.name,
          newVersion: p.newVersion,
        }));
        const pkgResults = await applyPatches(pkgPatches);
        for (const { filePath, count } of pkgResults) {
          clack.log.success(
            `Patched ${toProjectRelativePath(filePath)} (${count} change${count === 1 ? '' : 's'})`,
          );
        }

        const packageJsonChanged = pkgResults.some((r) => r.count > 0);
        if (packageJsonChanged) {
          const runInstall = await clack.confirm({
            message: `Run ${pc.cyan('pnpm install')} now to refresh the ${pc.bold('lockfile')} and ${pc.bold('node_modules')}?`,
            initialValue: true,
          });

          if (clack.isCancel(runInstall)) {
            clack.cancel('Cancelled.');
            process.exit(0);
          }

          if (runInstall) {
            const code = await runPnpmInstall(process.cwd());
            if (code !== 0) {
              clack.log.error(`pnpm install exited with code ${code ?? 'unknown'}`);
              process.exit(code ?? 1);
            }
            clack.log.success('pnpm install finished');
          }
        }
      }
    }

    const names = patches.map((p) => p.name).join(', ');
    clack.outro(`Suggested commit: ${pc.dim(`deps: bump ${names}`)}`);
  });
}
