import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
    // The Phaser vendor chunk is deliberate; the build also checks a gzip JS budget.
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: { codeSplitting: { groups: [{ name: 'phaser', test: /node_modules[\\/]phaser/ }] } },
    },
  },
});
