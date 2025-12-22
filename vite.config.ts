import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
    plugins: [preact()],
    build: {
        lib: {
            entry: 'src/widget.tsx',
            name: 'ExchangeWidget',
            formats: ['umd'],
            fileName: () => 'widget.js',
        },
        rollupOptions: {
            output: {
                manualChunks: undefined,
                inlineDynamicImports: true,
            },
        },
        cssCodeSplit: false,
        minify: 'esbuild',
        sourcemap: false,
    },
});