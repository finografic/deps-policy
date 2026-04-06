import type { DependencyGroup, DependencyPolicy, PackageType } from './types.js';

import { base } from './policy/base.js';
import { cli } from './policy/cli.js';
import { config } from './policy/config.js';
import { library } from './policy/library.js';

export type { DependencyGroup, DependencyPolicy, PackageType } from './types.js';
export { base, cli, config, library } from './policy/index.js';

export const policy: DependencyPolicy = {
  base,
  cli,
  library,
  config,
};

/**
 * Merge `policy.base` with the type-specific policy to produce the effective
 * set of dependencies for a given package type.
 *
 * genx usage:
 * ```ts
 * const effective = resolvePolicy('cli')
 * // apply effective.dependencies + effective.devDependencies to package.json
 * ```
 */
export function resolvePolicy(type: PackageType): DependencyGroup {
  const typePolicy = policy[type];
  return {
    dependencies: {
      ...policy.base.dependencies,
      ...typePolicy.dependencies,
    },
    devDependencies: {
      ...policy.base.devDependencies,
      ...typePolicy.devDependencies,
    },
    peerDependencies: {
      ...policy.base.peerDependencies,
      ...typePolicy.peerDependencies,
    },
  };
}
