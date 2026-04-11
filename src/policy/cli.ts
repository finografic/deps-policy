import type { DependencyGroup } from '../types.js';

/**
 * Additional deps for `genx:type:cli` packages.
 */
export const cli: DependencyGroup = {
  dependencies: {
    picocolors: '^1.1.1',
  },
};
