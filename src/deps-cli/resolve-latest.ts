import type { DepEntry, DepEntryWithLatest } from './types/deps.types.js';

const NPM_REGISTRY = 'https://registry.npmjs.org';
const GH_REGISTRY = 'https://npm.pkg.github.com';
const CONCURRENCY = 10;
const TIMEOUT_MS = 10_000;

function isVersionNewer(latest: string, bare: string): boolean {
  const toTuple = (v: string): number[] => v.split('.').map(Number);
  const a = toTuple(latest);
  const b = toTuple(bare);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return false;
}

async function fetchLatest(name: string): Promise<string | null> {
  const isFinografic = name.startsWith('@finografic/');
  const registry = isFinografic ? GH_REGISTRY : NPM_REGISTRY;
  const url = `${registry}/${encodeURIComponent(name).replace('%40', '@').replace('%2F', '/')}`;

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.npm.install-v1+json, application/json',
    'User-Agent': 'finografic-deps-policy-updater',
  };

  if (isFinografic) {
    const token = process.env['NPM_TOKEN'];
    if (!token) return null;
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const distTags = data['dist-tags'] as Record<string, string> | undefined;
    return distTags?.['latest'] ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function batchProcess<T, R>(items: T[], fn: (item: T) => Promise<R>, size: number): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    results.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  }
  return results;
}

export async function resolveLatestVersions(entries: DepEntry[]): Promise<DepEntryWithLatest[]> {
  const latests = await batchProcess(entries, (e) => fetchLatest(e.name), CONCURRENCY);
  return entries.map((entry, i) => {
    const latest = latests[i] ?? null;
    const outdated = latest !== null && isVersionNewer(latest, entry.bare);
    return { ...entry, latest, outdated, pinned: entry.prefix === '' };
  });
}
