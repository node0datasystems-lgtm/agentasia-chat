import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  deps: {
    alwaysBundle: ['@agentasia/business-const'],
  },
  dts: true,
  entry: [
    'src/index.ts',
    'src/modelProviders/index.ts',
    'src/modelProviders/agentasia.ts',
    'src/types/index.ts',
    'src/aiModels/*.ts',
  ],
  fixedExtension: false,
  format: ['esm'],
  outDir: 'dist',
  platform: 'neutral',
  target: 'es2022',
  tsconfig: './tsconfig.json',
});
