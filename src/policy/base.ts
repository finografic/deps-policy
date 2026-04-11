import type { DependencyGroup } from '../types.js';

const build: Record<string, string> = {
  'typescript': '^5.9.3',
  'tsdown': '^0.21.7',
  '@types/node': '^24.0.0',
};

const testing: Record<string, string> = {
  vitest: '^4.0.18',
};

const eslint: Record<string, string> = {
  'eslint': '9.39.2',
  '@eslint/js': '^9.39.2',
  '@finografic/eslint-config': '^9.18.4',
  'eslint-plugin-markdownlint': '^0.9.0',
  '@stylistic/eslint-plugin': '^5.6.1',
  '@typescript-eslint/eslint-plugin': '^8.51.0',
  '@typescript-eslint/parser': '^8.51.0',
  'typescript-eslint': '^8.51.0',
  'globals': '^17.3.0',
};

const formatting: Record<string, string> = {
  'oxfmt': '^0.43.0',
  '@finografic/oxfmt-config': '^1.5.0',
};

const hooks: Record<string, string> = {
  'husky': '^9.1.7',
  'lint-staged': '^16.2.7',
  '@commitlint/cli': '^20.2.0',
  '@commitlint/config-conventional': '^20.2.0',
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
