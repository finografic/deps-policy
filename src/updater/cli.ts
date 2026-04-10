import { runAudit } from './commands/audit/audit.cli.js';
import { runOutdated } from './commands/outdated/outdated.cli.js';
import { runUpdate } from './commands/update/update.cli.js';

// Load .env (NPM_TOKEN for GitHub Packages auth)
try {
  process.loadEnvFile('.env');
} catch {
  // .env not present — continue with existing env vars
}

// ─── entry ────────────────────────────────────────────────────────────────────

const command = process.argv[2];

switch (command) {
  case 'outdated':
    await runOutdated();
    break;
  case 'update':
    await runUpdate();
    break;
  case 'audit':
    await runAudit();
    break;
  default:
    console.error(`Usage: policy:outdated | policy:update | policy:audit`);
    process.exit(1);
}
