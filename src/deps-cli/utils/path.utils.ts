import { resolvePackageRoot } from 'utils/policy-dir.utils.js';

export function toProjectRelativePath(absPath: string): string {
  const root = resolvePackageRoot();
  const prefix = `${root}/`;
  return absPath.startsWith(prefix) ? absPath.slice(prefix.length) : absPath;
}
