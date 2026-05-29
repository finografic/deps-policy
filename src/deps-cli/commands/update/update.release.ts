import { spawn } from 'node:child_process';
import * as clack from '@clack/prompts';
import pc from 'picocolors';

const RELEASE_COMMIT_MESSAGE = 'deps: update deps-policy versions';

async function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  const exitCode = await new Promise<number | null>((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', resolve);
  });

  if (exitCode !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with code ${exitCode ?? 'unknown'}`);
  }
}

/** Build, commit policy changes, bump patch version, and push tags. Does not publish. */
export async function runReleasePipeline(cwd: string): Promise<void> {
  clack.log.step(pc.cyan('Release pipeline'));

  await runCommand('pnpm', ['build'], cwd);
  await runCommand('git', ['add', '.'], cwd);
  await runCommand('git', ['commit', '-m', RELEASE_COMMIT_MESSAGE], cwd);
  await runCommand('pnpm', ['run', 'release:check'], cwd);
  await runCommand('pnpm', ['version', 'patch'], cwd);
  await runCommand('git', ['push', '--follow-tags'], cwd);

  clack.log.success('Patch release pushed — run pnpm release:publish to publish to GitHub Packages');
}
