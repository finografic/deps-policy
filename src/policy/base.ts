import type { DependencyGroup } from '../types.js'

/**
 * Baseline devDependencies applied to every @finografic package,
 * regardless of type.
 */
export const base: DependencyGroup = {
  devDependencies: {
    typescript: '^5.9.0',
    tsdown: '^0.20.0',
    rimraf: '^6.0.0',
  },
}
