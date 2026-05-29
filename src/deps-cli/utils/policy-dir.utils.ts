import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PACKAGE_NAME = '@finografic/deps-policy';

function isDepsPolicyRoot(dir: string): boolean {
  try {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { name?: string };
    return pkg.name === PACKAGE_NAME && existsSync(join(dir, 'src/policy/base.deps.ts'));
  } catch {
    return false;
  }
}

function findDepsPolicyRoot(startDir: string): string | null {
  let dir = resolve(startDir);

  while (true) {
    if (isDepsPolicyRoot(dir)) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Absolute path to `src/policy/` — works from tsx dev, bundled global bin, and genx (cwd set). */
export function resolvePolicyDir(): string {
  const fromCwd = findDepsPolicyRoot(process.cwd());
  if (fromCwd) return join(fromCwd, 'src/policy');

  const fromModule = findDepsPolicyRoot(dirname(fileURLToPath(import.meta.url)));
  if (fromModule) return join(fromModule, 'src/policy');

  throw new Error(
    `Cannot find ${PACKAGE_NAME} policy sources (src/policy/*.deps.ts). ` +
      'Run from the deps-policy repo or use genx deps --update-policy (sets cwd via depsPolicyPath).',
  );
}
