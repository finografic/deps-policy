import type { DependencyGroup } from 'deps.types';

/**
 * Additional deps for `genx:type:cli` packages.
 */
export const cli: DependencyGroup = {
  dependencies: {
    '@clack/core': '1.2.0',
    '@clack/prompts': '^1.2.0',
    '@finografic/cli-kit': '^0.2.2',
    'picocolors': '^1.1.1',
  },
};
