import type { DependencyGroup } from 'deps.types';

const build: Record<string, string> = {
  'typescript': '6.0.2',
  'tsdown': '^0.21.10',
  '@types/node': '24.0.0',
};

const testing: Record<string, string> = {
  vitest: '^4.1.5',
};

// DEPRECATED: will be removed in the next major release
const _eslint: Record<string, string> = {
  'eslint': '9.39.2',
  '@eslint/js': '9.39.2',
  '@finografic/eslint-config': '^9.18.4',
  '@finografic/md-lint': '^0.9.4',
  '@stylistic/eslint-plugin': '^5.10.0',
  '@typescript-eslint/eslint-plugin': '^8.58.2',
  '@typescript-eslint/parser': '^8.58.2',
  'typescript-eslint': '^8.58.2',
  'globals': '^17.5.0',
};

export const linting: Record<string, string> = {
  'oxlint': '^1.61.0',
  'oxlint-tsgolint': '^0.21.1',
  '@finografic/md-lint': '^0.9.4',
  '@finografic/oxc-config': '^2.3.5',
  'globals': '^17.5.0',
};

export const formatting: Record<string, string> = {
  'oxfmt': '^0.46.0',
  '@finografic/oxfmt-config': '^1.11.1',
};

const hooks: Record<string, string> = {
  'husky': '^9.1.7',
  'lint-staged': '^16.4.0',
  '@commitlint/cli': '^20.5.2',
  '@commitlint/config-conventional': '^20.5.0',
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
    ...linting,
    ...formatting,
    ...hooks,
    ...ecosystem,
  },
};
