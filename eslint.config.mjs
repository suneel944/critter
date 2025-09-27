import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import playwright from 'eslint-plugin-playwright'
import eslintConfigPrettier from 'eslint-config-prettier'
import boundaries from 'eslint-plugin-boundaries'
import importPlugin from 'eslint-plugin-import'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Small helper to scope presets to files with optional languageOptions merge.
const scopePreset = (preset, { files, languageOptions = {} }) => ({
  ...preset,
  files,
  languageOptions: { ...(preset.languageOptions ?? {}), ...languageOptions },
})
const scopeAnyPreset = (maybeArr, scope) =>
  (Array.isArray(maybeArr) ? maybeArr : [maybeArr]).map(p => scopePreset(p, scope))

const pwRecommended = playwright.configs['flat/recommended']

export default [
  /* 0) Ignore build/vendor */
  { ignores: ['node_modules', 'dist', 'build', 'coverage', 'reports', '.next'] },

  /* 1) JS files */
  scopePreset(js.configs.recommended, {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  }),

  /* 2) TS files — typed linting for the whole repo via tsconfig.eslint.json */
  ...scopeAnyPreset(tseslint.configs.recommendedTypeChecked, {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
      globals: { ...globals.node },
    },
  }),

  /* 3) Import hygiene + resolver for TS path aliases */
  {
    files: ['**/*.{ts,tsx,js}'],
    plugins: { import: importPlugin },
    settings: {
      // Make eslint-plugin-import understand TS + your path aliases
      'import/resolver': {
        typescript: { project: path.join(__dirname, 'tsconfig.json') },
        node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      'import/order': [
        'error',
        {
          groups: [
            ['builtin', 'external', 'internal'],
            ['parent', 'sibling', 'index', 'object', 'type'],
          ],
          pathGroups: [{ pattern: '@critter/**', group: 'internal', position: 'before' }],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            'tests/**',
            'playwright.config.ts',
            'eslint.config.mjs',
            'scripts/**',
            'config/**',
          ],
        },
      ],
      // Prefer aliases over deep relative climbs into framework
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../src/framework/**', '../..*/framework/**', '../../../*'],
              message: 'Use @critter/* path aliases instead of deep relative imports.',
            },
          ],
        },
      ],
    },
  },

  /* 4) Architectural boundaries (hexagonal rules) */
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src', 'tests', 'config', 'infrastructure'],
      'boundaries/elements': [
        { type: 'barrel',       pattern: 'src/framework/index.ts' },
        { type: 'adapters',     pattern: 'src/framework/adapters/**' },
        { type: 'api',          pattern: 'src/framework/api/**' },
        { type: 'brokers',      pattern: 'src/framework/brokers/**' },
        { type: 'providers',    pattern: 'src/framework/providers/**' },
        { type: 'capabilities', pattern: 'src/framework/capabilities/**' },
        { type: 'config',       pattern: 'src/framework/config/**' },
        { type: 'factories',    pattern: 'src/framework/factories/**' },
        { type: 'logging',      pattern: 'src/framework/logging/**' },
        { type: 'shared',       pattern: 'src/framework/shared/**' },
        { type: 'tests',        pattern: 'tests/**' },
        { type: 'infra',        pattern: 'infrastructure/**' },
      ],
    },
    rules: {
      'boundaries/element-types': ['error', {
        default: 'allow',
        rules: [
          // Adapters must not depend on providers (use DeviceBroker)
          {
            from: ['adapters'],
            disallow: ['providers'],
            message: 'Adapters must not import providers. Use DeviceBroker.',
          },

          // Runtime code must never import infrastructure
          {
            from: [
              'adapters', 'api', 'brokers', 'providers',
              'capabilities', 'config', 'factories', 'logging', 'shared',
            ],
            disallow: ['infra'],
            message: 'Runtime code must not import infrastructure/**.',
          },
        ],
      }],
    },
  },

  /* 5) Tests: enforce BARREL-ONLY imports (`@critter`, not `@critter/*`) */
  {
    files: ['tests/**', '**/*.{spec,test}.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@critter/*'],
              message:
                'Tests must import framework via the @critter barrel (src/framework/index.ts), not internal paths.',
            },
            {
              group: ['../../src/framework/**', '../..*/framework/**', '../../../*'],
              message: 'Use the @critter barrel, not deep relative imports.',
            },
          ],
        },
      ],
    },
  },

  /* 6) Env access policy — only config layer & root config may read process.env */
  {
    files: ['src/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Use ConfigManager; do not access process.env outside the config layer.',
        },
      ],
    },
  },
  {
    files: ['src/framework/config/**', 'config/**', 'playwright.config.ts'],
    rules: { 'no-restricted-properties': 'off' },
  },

  /* 7) Async hygiene + TS niceties + Prettier last */
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false, returns: true }, checksConditionals: true },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      ...eslintConfigPrettier.rules,
    },
  },

  /* 8) Playwright rules (tests only) */
  {
    ...pwRecommended,
    files: ['tests/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}', 'playwright.config.ts'],
    rules: {
      ...(pwRecommended.rules ?? {}),
      'playwright/expect-expect': [
        'error',
        { assertFunctionNames: ['expect', 'expectStatus', 'validateSchema'] },
      ],
      'playwright/no-standalone-expect': 'error',
    },
  },
]
