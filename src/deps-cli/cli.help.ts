import type { HelpConfig } from '@finografic/cli-kit/render-help';

import { CLI_BIN } from './bin-name.js';

export const cliHelp: HelpConfig = {
  main: {
    bin: CLI_BIN,
    args: '<command>',
  },

  commands: {
    title: 'Commands',
    list: [
      { label: 'audit', description: 'Check packages against the OSV vulnerability database' },
      { label: 'outdated', description: 'Show which policy packages have newer versions available' },
      { label: 'update', description: 'Interactively update outdated packages in policy files' },
      { label: 'help', description: 'Show this help message' },
    ],
  },

  examples: {
    title: 'Examples',
    list: [
      { label: 'Check for vulnerabilities', description: `${CLI_BIN} audit` },
      { label: 'Show outdated packages', description: `${CLI_BIN} outdated` },
      { label: 'Update packages interactively', description: `${CLI_BIN} update` },
      { label: 'Update, commit, and patch-release', description: `${CLI_BIN} update --release` },
    ],
  },

  footer: {
    title: 'Show Help',
    list: [{ label: `${CLI_BIN} <command> --help`, description: '' }],
  },
};
