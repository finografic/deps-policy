import type { DependencyGroup } from 'deps.types';

/**
 * Additional deps for `genx:type:cli` packages.
 */
export const cli: DependencyGroup = {
  dependencies: {
    '@clack/core': '1.4.3',
    '@clack/prompts': '^1.7.0',
    '@finografic/cli-kit': '^2.0.0',
    // Node-only XDG config paths + JSONC I/O live at `@finografic/core/xdg`
    // (moved out of `@finografic/cli-kit/xdg` in cli-kit 2.0.0).
    '@finografic/core': '^0.16.1',
    'picocolors': '^1.1.1',
  },
};
