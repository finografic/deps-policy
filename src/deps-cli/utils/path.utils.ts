import { dirname, resolve } from 'node:path';

export function toProjectRelativePath(absPath: string): string {
  const root = resolve(dirname(__dirname), '..');
  return absPath.replace(root + '/', '');
}
