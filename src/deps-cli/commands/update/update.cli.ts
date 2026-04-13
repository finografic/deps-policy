import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import process from 'node:process';
import * as clack from '@clack/prompts';
import { collectDeps } from 'collect-deps.js';
import { renderCommandHelp } from 'core/render-help/index.js';
import { printOutdated } from 'output/outdated.output.js';
import pc from 'picocolors';
import { resolveLatestVersions } from 'resolve-latest.js';

import { toProjectRelativePath } from 'utils/path.utils.js';

import { help } from './update.help.js';
import { applyPatches, getApplicablePatchesForPackageJson } from './update.logic.js';
import { selectUpdatePatches } from './update.prompts.js';

function runPnpmInstall(cwd: string): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', ['install'], {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('close', (code) => resolve(code));
  });
}

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

  const packageJsonPath = resolve(process.cwd(), 'package.json');
  const pkgApplicable = await getApplicablePatchesForPackageJson(packageJsonPath, patches);

  if (pkgApplicable.length > 0) {
    const syncPkg = await clack.confirm({
      message: `Apply the same ${pkgApplicable.length} version bump${pkgApplicable.length === 1 ? '' : 's'} to ${pc.bold('package.json')}?`,
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
          message: `Run ${pc.bold('pnpm install')} now to refresh the lockfile and node_modules?`,
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
}
