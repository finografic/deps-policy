import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export function toProjectRelativePath(absPath: string): string {
  const root = resolve(dirname(__dirname), '..');
  return absPath.replace(root + '/', '');
}
