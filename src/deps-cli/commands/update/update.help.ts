import type { CommandHelpConfig } from '@finografic/cli-kit/render-help';

export const help: CommandHelpConfig = {
  command: 'policy update',
  description: 'Interactively update outdated packages in policy files',
  usage: 'policy update [--include-pinned]',
  options: [
    {
      flag: '--include-pinned',
      description: 'Also show pinned (exact-version) packages in the update list',
    },
  ],
  examples: [
    { command: 'policy update', description: 'Review and apply updates interactively' },
    { command: 'policy update --include-pinned', description: 'Include pinned packages in the update list' },
  ],
  howItWorks: [
    'Collects all packages from policy source files (base.ts, cli.ts, library.ts, config.ts)',
    'Fetches the latest version of each package from the npm registry',
    'Shows a table of outdated packages (pinned packages excluded by default)',
    'Prompts to select which outdated packages to update (nothing pre-selected)',
    'For each selected pinned package: skip / pin to latest / add range prefix',
    'Patches the version strings in the policy source files',
    'Optionally applies the same bumps to this project package.json when those deps are declared there',
    'Optionally runs pnpm install after package.json changes',
  ],
};
