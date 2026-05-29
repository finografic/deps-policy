import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
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

/** Package root when discoverable; null when the deps-policy repo cannot be located. */
export function tryResolvePackageRoot(): string | null {
  return findDepsPolicyRoot(process.cwd()) ?? findDepsPolicyRoot(dirname(fileURLToPath(import.meta.url)));
}

export function resolvePackageRoot(): string {
  const root = tryResolvePackageRoot();
  if (!root) {
    throw new Error(
      `Cannot find ${PACKAGE_NAME} package root. ` +
        'Run from the deps-policy repo or use genx deps --update-policy (sets cwd via depsPolicyPath).',
    );
  }
  return root;
}

export function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(join(resolvePackageRoot(), 'package.json'), 'utf8')) as {
    version: string;
  };
  return pkg.version;
}

/** Absolute path to `src/policy/` — works from tsx dev, bundled global bin, and genx (cwd set). */
export function resolvePolicyDir(): string {
  return join(resolvePackageRoot(), 'src/policy');
}

/** Load `.env` from the package root (NPM_TOKEN), then fall back to cwd. */
export function loadDepsPolicyEnv(): void {
  const root = tryResolvePackageRoot();
  if (root) {
    const envPath = join(root, '.env');
    if (existsSync(envPath)) {
      process.loadEnvFile(envPath);
      return;
    }
  }

  try {
    process.loadEnvFile('.env');
  } catch {
    // .env not present — continue with existing env vars
  }
}
