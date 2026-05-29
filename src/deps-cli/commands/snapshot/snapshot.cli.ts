import { createRequire } from 'node:module';
import { createXdgPaths, writeJsonc } from '@finografic/cli-kit/xdg';
import * as clack from '@clack/prompts';
import pc from 'picocolors';
import { base, lintingAndFormatting } from 'policy/base.deps.js';
import { cli } from 'policy/cli.deps.js';
import { config } from 'policy/config.deps.js';
import { library } from 'policy/library.deps.js';
import { toolchain } from 'policy/toolchain.js';

const xdg = createXdgPaths();
export const DEPS_POLICY_CONFIG_PATH = xdg.configPath('deps-policy');

/** Write current policy sources to the local XDG file (genx reads this first). */
export async function writePolicySnapshot(): Promise<void> {
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
    lintingAndFormatting,
    toolchain,
  };

  await writeJsonc(DEPS_POLICY_CONFIG_PATH, snapshot);
  clack.log.success(`Snapshot written to ${pc.dim(DEPS_POLICY_CONFIG_PATH)} ${pc.dim(`(v${version})`)}`);
}
