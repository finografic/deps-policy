import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: {
      'index': 'src/index.ts',
      'policy/index': 'src/policy/index.ts',
      'deps.types': 'src/deps.types.ts',
      'cli': 'src/deps-cli/commands/index.ts',
    },
    format: ['esm'],
    dts: true,
    clean: true,
  },
  {
    entry: { 'bin/policy': 'src/deps-cli/cli.ts' },
    format: ['esm'],
    dts: false,
    clean: false,
  },
]);
