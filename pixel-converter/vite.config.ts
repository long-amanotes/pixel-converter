import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            if (id.includes('@mui/material') || id.includes('@mui/icons-material') || 
                id.includes('@mui/lab') || id.includes('@emotion')) {
              return 'vendor-mui';
            }
            if (id.includes('@refinedev')) {
              return 'vendor-refine';
            }
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
          }
        },
      },
    },
    // Increase chunk size warning limit since Refine is large
    chunkSizeWarningLimit: 650,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
