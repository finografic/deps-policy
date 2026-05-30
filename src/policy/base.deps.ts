import type { DependencyGroup } from 'deps.types';

const build: Record<string, string> = {
  'typescript': '5.9.3',
  'tsdown': '^0.22.1',
  '@types/node': '24.12.0',
};

const testing: Record<string, string> = {
  vitest: '^4.1.7',
};

// DEPRECATED: will be removed in the next major release
const _eslint: Record<string, string> = {
  'eslint': '9.39.2',
  '@eslint/js': '9.39.2',
  '@finografic/eslint-config': '^9.18.4',
  '@finografic/md-lint': '^0.16.0',
  '@stylistic/eslint-plugin': '^5.10.0',
  '@typescript-eslint/eslint-plugin': '^8.58.2',
  '@typescript-eslint/parser': '^8.58.2',
  'typescript-eslint': '^8.58.2',
};

/** Oxlint / markdown / OXC tooling plus `oxfmt` (config lives in `@finografic/oxc-config`). */
export const lintingAndFormatting: Record<string, string> = {
  'oxlint': '^1.67.0',
  'oxlint-tsgolint': '^0.23.0',
  '@finografic/md-lint': '^0.16.0',
  '@finografic/oxc-config': '^2.6.4',
  'oxfmt': '^0.52.0',
};

const hooks: Record<string, string> = {
  'husky': '^9.1.7',
  'lint-staged': '^17.0.6',
  '@commitlint/cli': '^21.0.2',
  '@commitlint/config-conventional': '^21.0.2',
};

const ecosystem: Record<string, string> = {
  '@finografic/project-scripts': '^1.3.3',
};

/**
 * Baseline devDependencies applied to every @finografic package, regardless of type.
 */
export const base: DependencyGroup = {
  devDependencies: {
    ...build,
    ...testing,
    ...lintingAndFormatting,
    ...hooks,
    ...ecosystem,
  },
};
