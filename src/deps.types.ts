export interface DependencyGroup {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

export type DependencyKind = keyof DependencyGroup;

/**
 * The package types recognised by the @finografic ecosystem.
 */
export type PackageType = 'cli' | 'library' | 'config' | 'react';

export interface DependencyPolicy {
  base: DependencyGroup;
  cli: DependencyGroup;
  library: DependencyGroup;
  config: DependencyGroup;
  react: DependencyGroup;
}

export interface ToolchainPolicy {
  node: string;
  pnpm: string;
}
