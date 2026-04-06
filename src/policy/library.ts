import type { DependencyGroup } from '../types.js'

/** Additional deps for `genx:type:library` packages. */
export const library: DependencyGroup = {
  devDependencies: {
    '@types/node': '^24.0.0',
  },
}
