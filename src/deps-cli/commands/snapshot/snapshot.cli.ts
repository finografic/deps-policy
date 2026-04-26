import { createRequire } from 'node:module';
import { withHelp } from '@finografic/cli-kit/render-help';
import { createXdgPaths, writeJsonc } from '@finografic/cli-kit/xdg';
import * as clack from '@clack/prompts';
import pc from 'picocolors';
import { base } from 'policy/base.deps.js';
import { cli } from 'policy/cli.deps.js';
import { config } from 'policy/config.deps.js';
import { library } from 'policy/library.deps.js';

import { help } from './snapshot.help.js';

const xdg = createXdgPaths();
export const DEPS_POLICY_CONFIG_PATH = xdg.configPath('deps-policy');

export async function runSnapshot(argv: string[] = []): Promise<void> {
  return withHelp(argv, help, async () => {
    const require = createRequire(import.meta.url);
    const { version } = require('../../../../package.json') as { version: string };

    const snapshot = {
      _meta: {
        package: '@finografic/deps-policy',
        version,
        generatedAt: new Date().toISOString(),
      },
      base,
      cli,
      library,
      config,
    };

    await writeJsonc(DEPS_POLICY_CONFIG_PATH, snapshot);
    clack.log.success(`Snapshot written to ${pc.dim(DEPS_POLICY_CONFIG_PATH)} ${pc.dim(`(v${version})`)}`);
  });
}
