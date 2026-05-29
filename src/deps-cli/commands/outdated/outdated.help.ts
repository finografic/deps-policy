import type { CommandHelpConfig } from '@finografic/cli-kit/render-help';

import { CLI_BIN } from '../../bin-name.js';

export const help: CommandHelpConfig = {
  command: `${CLI_BIN} outdated`,
  description: 'Show which policy packages have newer versions available',
  usage: `${CLI_BIN} outdated`,
  examples: [
    { command: `${CLI_BIN} outdated`, description: 'List all outdated packages across policy files' },
  ],
};
