import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: 'src/widget.ts', 
      name: 'ExchangeWidget', 
      formats: ['umd'], 
      fileName: () => 'main.js', 
    },
    rollupOptions: {
        output: {
            manualChunks: undefined,
        },
    },
  },
});