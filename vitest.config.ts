import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom for DOM testing
    environment: 'jsdom',

    // Global test utilities
    globals: true,

    // Setup file for test configuration
    setupFiles: './src/test/setup.ts',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'vite.config.ts',
        'vitest.config.ts'
      ],
      // Aim for 100% coverage per CLAUDE.MD
      thresholds: {
        lines: 0,      // Start at 0, increase gradually
        functions: 0,
        branches: 0,
        statements: 0
      }
    },

    // Include and exclude patterns
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'build'],
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
