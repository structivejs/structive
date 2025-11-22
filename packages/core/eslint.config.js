import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['*.js', '*.mjs'],
      },
    },
    rules: {
      // Allow underscore prefix for private fields
      'no-underscore-dangle': 'off',

      // Disable 'any' type (prefer unknown)
      '@typescript-eslint/no-explicit-any': 'warn',

      // No unused variables (except prefixed with _)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Prefer const over let
      'prefer-const': 'error',

      // No var declarations
      'no-var': 'error',

      // Prefer template literals
      'prefer-template': 'warn',

      // No console.log in production code
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      // Require === and !==
      eqeqeq: ['error', 'always'],

      // No debugger
      'no-debugger': 'error',

      // Curly braces for all control statements
      curly: ['error', 'all'],

      // Max line length
      'max-len': [
        'warn',
        {
          code: 120,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],

      // Prefer arrow functions for callbacks
      'prefer-arrow-callback': 'warn',

      // No parameter reassignment
      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],
    },
  },
  {
    // Test files have relaxed rules
    files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['**/__tests__/**/*.ts', '**/*.test.ts'],
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'no-console': 'off',
    },
  },
  {
    // Ignore patterns
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
      'rollup.config.js',
      'vitest.config.ts',
    ],
  }
);
