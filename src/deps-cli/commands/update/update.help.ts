import type { CommandHelpConfig } from 'core/render-help/index.js';

export const help: CommandHelpConfig = {
  command: 'policy update',
  description: 'Interactively update outdated packages in policy files',
  usage: 'policy update',
  examples: [{ command: 'policy update', description: 'Review and apply updates interactively' }],
  howItWorks: [
    'Collects all packages from policy source files (base.ts, cli.ts, library.ts, config.ts)',
    'Fetches the latest version of each package from the npm registry',
    'Shows a table of outdated packages',
    'Prompts to select range-prefixed packages to bump (multi-select)',
    'Prompts individually for pinned packages: skip / pin to latest / add range prefix',
    'Patches the version strings in the source files',
  ],
};
