export default {
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [
      'src/polyfills.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportOnFailure: true,
      exclude: [
        'coverage/**',
        'dist/**',
        '__tests__/**',
        '*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '**/*.d.ts',
        // types-only files (no runtime code)
        'src/**/types.ts',
        'src/@types/**',
        '**/node_modules/**',
        'vitest.config.ts',
        'rollup.config.js'
      ],
      include: [
        'src/**/*.{js,ts}'
      ],
      all: true,
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80
    }
  }
}