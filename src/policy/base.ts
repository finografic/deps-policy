import type { DependencyGroup } from '../types.js';

/**
 * Baseline devDependencies applied to every @finografic package,
 * regardless of type.
 */
export const base: DependencyGroup = {
  devDependencies: {
    // build
    typescript: '^5.9.3',
    tsdown: '^0.20.3',
    '@types/node': '^24.0.0',
    // testing
    vitest: '^4.0.18',
    // eslint
    eslint: '9.39.2',
    '@eslint/js': '^9.39.2',
    '@finografic/eslint-config': '^9.18.4',
    '@stylistic/eslint-plugin': '^5.6.1',
    '@typescript-eslint/eslint-plugin': '^8.51.0',
    '@typescript-eslint/parser': '^8.51.0',
    'typescript-eslint': '^8.51.0',
    globals: '^17.3.0',
    // formatting
    oxfmt: '^0.43.0',
    '@finografic/oxfmt-config': '^1.0.3',
    // git hooks
    'simple-git-hooks': '^2.13.1',
    'lint-staged': '^16.2.7',
    // commitlint
    '@commitlint/cli': '^20.2.0',
    '@commitlint/config-conventional': '^20.2.0',
  },
};
