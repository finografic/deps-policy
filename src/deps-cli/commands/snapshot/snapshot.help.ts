import type { CommandHelpConfig } from '@finografic/cli-kit/render-help';
import { createXdgPaths } from '@finografic/cli-kit/xdg';

const xdg = createXdgPaths();

export const help: CommandHelpConfig = {
  command: 'policy snapshot',
  description: 'Write the current policy to the local XDG config file',
  usage: 'policy snapshot',
  examples: [
    {
      command: 'policy snapshot',
      description: `Write policy to ${xdg.configPath('deps-policy')}`,
    },
  ],
  howItWorks: [
    'Reads the current policy from source (base, cli, library, config groups)',
    `Writes a JSON snapshot to ${xdg.configPath('deps-policy')}`,
    'genx reads this file first when available, bypassing the published npm version',
    'Run automatically at the end of policy:update',
  ],
};
