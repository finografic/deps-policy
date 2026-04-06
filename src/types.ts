export interface DependencyGroup {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

/** The package types recognised by the @finografic ecosystem. */
export type PackageType = 'cli' | 'library' | 'config'

export interface DependencyPolicy {
  base: DependencyGroup
  cli: DependencyGroup
  library: DependencyGroup
  config: DependencyGroup
}
