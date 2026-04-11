import { readFile, writeFile } from 'node:fs/promises';

export type PatchInput = { filePath: string; name: string; newVersion: string };

export interface PatchResult {
  filePath: string;
  count: number;
}

export async function applyVersionPatch(
  filePath: string,
  name: string,
  newVersion: string,
): Promise<boolean> {
  const src = await readFile(filePath, 'utf8');
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match either a quoted key ('name' or "name") or a bare identifier (name)
  // followed by :, then a quoted version string. Replace only the version.
  const re = new RegExp(`(['"]${esc}['"]|${esc})(\\s*:\\s*)(['"])([^'"]+)(['"])`, 'g');

  let matched = false;
  const patched = src.replace(
    re,
    (_m, key: string, colon: string, open: string, _ver: string, close: string) => {
      matched = true;
      return `${key}${colon}${open}${newVersion}${close}`;
    },
  );

  if (!matched) return false;
  await writeFile(filePath, patched, 'utf8');
  return true;
}

export async function applyPatches(patches: PatchInput[]): Promise<PatchResult[]> {
  const counts = new Map<string, number>();

  for (const { filePath, name, newVersion } of patches) {
    const changed = await applyVersionPatch(filePath, name, newVersion);
    if (changed) counts.set(filePath, (counts.get(filePath) ?? 0) + 1);
  }

  return [...counts.entries()].map(([filePath, count]) => ({ filePath, count }));
}
