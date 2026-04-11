import type { CommandHelpConfig } from 'core/render-help/index.js';

export const help: CommandHelpConfig = {
  command: 'policy audit',
  description: 'Check policy packages against the OSV vulnerability database',
  usage: 'policy audit',
  examples: [{ command: 'policy audit', description: 'Scan all policy packages for known vulnerabilities' }],
};
