import type { DependencyGroup } from 'deps.types';

const build: Record<string, string> = {
  'typescript': '6.0.2',
  'tsdown': '^0.21.8',
  '@types/node': '24.0.0',
};

const testing: Record<string, string> = {
  vitest: '^4.1.4',
};

const eslint: Record<string, string> = {
  'eslint': '9.39.2',
  '@eslint/js': '9.39.2',
  '@finografic/eslint-config': '^9.18.4',
  '@finografic/md-lint': '^0.6.1',
  '@stylistic/eslint-plugin': '^5.10.0',
  '@typescript-eslint/eslint-plugin': '^8.58.2',
  '@typescript-eslint/parser': '^8.58.2',
  'typescript-eslint': '^8.58.2',
  'globals': '^17.5.0',
};

const formatting: Record<string, string> = {
  'oxfmt': '^0.45.0',
  '@finografic/oxfmt-config': '^1.7.4',
};

const hooks: Record<string, string> = {
  'husky': '^9.1.7',
  'lint-staged': '^16.4.0',
  '@commitlint/cli': '^20.5.0',
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
    ...eslint,
    ...formatting,
    ...hooks,
    ...ecosystem,
  },
};
