#!/usr/bin/env node

import { createRequire } from 'node:module';
import process from 'node:process';
import { runAudit } from 'deps-cli/commands/audit/audit.cli.js';
import { runOutdated } from 'deps-cli/commands/outdated/outdated.cli.js';
import { runUpdate } from 'deps-cli/commands/update/update.cli.js';

const require = createRequire(import.meta.url);
const { version } = require('../../package.json') as { version: string };

// Load .env (NPM_TOKEN for GitHub Packages auth)
try {
  process.loadEnvFile('.env');
} catch {
  // .env not present — continue with existing env vars
}

type CommandHandler = () => Promise<void> | void;

async function main(): Promise<void> {
  const [, , ...argv] = process.argv;
  const [command] = argv;

  /* ────────────────────────────────────────────────────────── */
  /* Root help / version                                        */
  /* ────────────────────────────────────────────────────────── */

  if (!command || command === '--help' || command === '-h') {
    console.log(`Usage: policy:<command>\n`);
    console.log(`Commands: outdated | update | audit`);
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
    outdated: async () => {
      await runOutdated();
    },
    update: async () => {
      await runUpdate();
    },
    audit: async () => {
      await runAudit();
    },
  };

  /* ────────────────────────────────────────────────────────── */
  /* Guards                                                     */
  /* ────────────────────────────────────────────────────────── */

  if (!commands[command]) {
    console.error(`Unknown command: ${command}`);
    console.error(`Commands: outdated | update | audit`);
    process.exit(1);
    return;
  }

  /* ────────────────────────────────────────────────────────── */
  /* Execute                                                    */
  /* ────────────────────────────────────────────────────────── */

  await commands[command]();
}

/* ────────────────────────────────────────────────────────── */
/* Bootstrap                                                  */
/* ────────────────────────────────────────────────────────── */

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
