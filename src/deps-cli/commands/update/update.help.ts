import type { CommandHelpConfig } from '@finografic/cli-kit/render-help';

import { CLI_BIN } from '../../bin-name.js';

export const help: CommandHelpConfig = {
  command: `${CLI_BIN} update`,
  description: 'Interactively update outdated packages in policy files',
  usage: `${CLI_BIN} update [--yes] [--release] [--include-pinned]`,
  options: [
    {
      flag: '-y, --yes',
      description: 'Skip all prompts — auto-select every eligible package and apply without confirmation',
    },
    {
      flag: '--release',
      description:
        'Non-interactive update, then build, commit, patch version bump, and push tags (does not publish)',
    },
    {
      flag: '--include-pinned',
      description: 'Also show pinned (exact-version) packages in the update list',
    },
  ],
  examples: [
    { command: `${CLI_BIN} update`, description: 'Review and apply updates interactively' },
    {
      command: `${CLI_BIN} update --yes`,
      description: 'Apply all updates non-interactively (CI / scripting)',
    },
    {
      command: `${CLI_BIN} update --release`,
      description: 'Apply all updates, then build, commit, and patch-release',
    },
    {
      command: `${CLI_BIN} update --yes --include-pinned`,
      description: 'Apply all updates including pinned packages',
    },
    {
      command: `${CLI_BIN} update --include-pinned`,
      description: 'Include pinned packages in the interactive list',
    },
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
    'Writes a JSON snapshot of the full policy to the local XDG config (genx reads this first)',
    'With --release: runs build, git commit, release:check, version patch, and git push --follow-tags',
  ],
};
