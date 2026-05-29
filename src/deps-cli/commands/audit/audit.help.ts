import type { CommandHelpConfig } from '@finografic/cli-kit/render-help';

import { CLI_BIN } from '../../bin-name.js';

export const help: CommandHelpConfig = {
  command: `${CLI_BIN} audit`,
  description: 'Check policy packages against the OSV vulnerability database',
  usage: `${CLI_BIN} audit`,
  examples: [
    { command: `${CLI_BIN} audit`, description: 'Scan all policy packages for known vulnerabilities' },
  ],
};
