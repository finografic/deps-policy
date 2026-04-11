import type { HelpConfig } from 'core/render-help/index.js';

export const cliHelp: HelpConfig = {
  main: {
    bin: 'policy',
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
      { label: 'Check for vulnerabilities', description: 'policy audit' },
      { label: 'Show outdated packages', description: 'policy outdated' },
      { label: 'Update packages interactively', description: 'policy update' },
    ],
  },

  footer: {
    title: 'Show Help',
    list: [{ label: 'policy <command> --help', description: '' }],
  },
};
