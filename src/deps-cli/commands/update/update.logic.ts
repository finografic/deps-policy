import { readFile, writeFile } from 'node:fs/promises';

export interface PatchInput {
  filePath: string;
  name: string;
  newVersion: string;
}

/** When the same package appears in multiple policy patches, keep the last target version. */
export function dedupePatchesByName(patches: PatchInput[]): PatchInput[] {
  const byName = new Map<string, PatchInput>();
  for (const p of patches) {
    byName.set(p.name, p);
  }
  return [...byName.values()];
}

function versionKeyPattern(name: string): RegExp {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(['"]${esc}['"]|${esc})(\\s*:\\s*)(['"])([^'"]+)(['"])`, 'g');
}

/**
 * Returns patches whose package name exists in `package.json` with a different version string than
 * `newVersion` (so applying them would change the file).
 */
export async function getApplicablePatchesForPackageJson(
  packageJsonPath: string,
  patches: PatchInput[],
): Promise<PatchInput[]> {
  let src: string;
  try {
    src = await readFile(packageJsonPath, 'utf8');
  } catch {
    return [];
  }

  const unique = dedupePatchesByName(patches);
  const applicable: PatchInput[] = [];

  for (const p of unique) {
    const re = versionKeyPattern(p.name);
    re.lastIndex = 0;
    const m = re.exec(src);
    if (m !== null && m[4] !== p.newVersion) {
      applicable.push(p);
    }
  }

  return applicable;
}

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
  // Match either a quoted key ('name' or "name") or a bare identifier (name)
  // followed by :, then a quoted version string. Replace only the version.
  const re = versionKeyPattern(name);

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
