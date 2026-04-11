import type { CommandHelpConfig } from 'core/render-help/index.js';

export const help: CommandHelpConfig = {
  command: 'policy outdated',
  description: 'Show which policy packages have newer versions available',
  usage: 'policy outdated',
  examples: [{ command: 'policy outdated', description: 'List all outdated packages across policy files' }],
};
