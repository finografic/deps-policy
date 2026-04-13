import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'policy/index': 'src/policy/index.ts',
    'deps.types': 'src/deps.types.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
});
