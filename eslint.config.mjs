import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import playwright from 'eslint-plugin-playwright'
import eslintConfigPrettier from 'eslint-config-prettier'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const scopePreset = (preset, { files, languageOptions = {} }) => ({
  ...preset,
  files,
  languageOptions: {
    ...(preset.languageOptions ?? {}),
    ...languageOptions,
  },
})

const scopeAnyPreset = (presetMaybeArray, scope) => {
  const arr = Array.isArray(presetMaybeArray) ? presetMaybeArray : [presetMaybeArray]
  return arr.map((p) => scopePreset(p, scope))
}

const pwRecommended = playwright.configs['flat/recommended']

export default [
  // ignore build/vendor
  { ignores: ['node_modules', 'dist', 'build', 'coverage'] },

  // JS files
  scopePreset(js.configs.recommended, {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  }),

  // TS files — typed linting for the whole repo
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

  // tone down a few noisy rules globally
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
    },
  },

  // Playwright: declare plugin ONCE via recommended preset, scoped to tests
  {
    ...pwRecommended,
    files: ['tests/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}', 'playwright.config.ts'],
    rules: {
      ...(pwRecommended.rules ?? {}),
      // use the correct option name: assertFunctionNames
      'playwright/expect-expect': [
        'error',
        {
          // include default 'expect' plus your helpers
          assertFunctionNames: ['expect', 'expectStatus', 'validateSchema'],
        },
      ],
    },
  },

  // Prettier compatibility last
  { rules: eslintConfigPrettier.rules },
]
