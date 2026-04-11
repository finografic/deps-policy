#!/usr/bin/env node

import { createRequire } from 'node:module';
import process from 'node:process';
import { renderHelp } from 'core/render-help/index.js';
import { runAudit } from 'deps-cli/commands/audit/audit.cli.js';
import { runOutdated } from 'deps-cli/commands/outdated/outdated.cli.js';
import { runUpdate } from 'deps-cli/commands/update/update.cli.js';

import { cliHelp } from './cli.help.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

// Load .env (NPM_TOKEN for GitHub Packages auth)
try {
  process.loadEnvFile('.env');
} catch {
  // .env not present — continue with existing env vars
}

type CommandHandler = (argv: string[]) => Promise<void> | void;

async function main(): Promise<void> {
  const [, , ...argv] = process.argv;
  const [command = '', ...args] = argv;

  /* ────────────────────────────────────────────────────────── */
  /* Root help / version                                        */
  /* ────────────────────────────────────────────────────────── */

  if (!command || command === '--help' || command === '-h') {
    renderHelp(cliHelp);
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log(version);
    return;
  }

  /* ────────────────────────────────────────────────────────── */
  /* Command registry                                           */
  /* ────────────────────────────────────────────────────────── */

  const commands: Record<string, CommandHandler> = {
    outdated: async (a) => {
      await runOutdated(a);
    },
    update: async (a) => {
      await runUpdate(a);
    },
    audit: async (a) => {
      await runAudit(a);
    },
    help: () => {
      renderHelp(cliHelp);
    },
  };

  /* ────────────────────────────────────────────────────────── */
  /* Guards                                                     */
  /* ────────────────────────────────────────────────────────── */

  if (!commands[command]) {
    console.error(`Unknown command: ${command}`);
    renderHelp(cliHelp);
    process.exit(1);
    return;
  }

  /* ────────────────────────────────────────────────────────── */
  /* Execute                                                    */
  /* ────────────────────────────────────────────────────────── */

  await commands[command](args);
}

/* ────────────────────────────────────────────────────────── */
/* Bootstrap                                                  */
/* ────────────────────────────────────────────────────────── */

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
