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

  // Calm down the noisiest rules globally (still typed)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/require-await': 'off',

      // keep these as warnings while types are tightened
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
    },
  },

  // Playwright recommended for test files only
  ...scopeAnyPreset(playwright.configs['flat/recommended'], {
    files: ['tests/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}', 'playwright.config.ts'],
  }),

  // Extra Playwright rule tuning (must declare plugin in same block)
  {
    files: ['tests/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],
    plugins: { playwright },
    rules: {
      'playwright/expect-expect': [
        'error',
        { additionalAssertFunctionNames: ['expectStatus', 'validateSchema'] },
      ],
    },
  },

  // Prettier compatibility last
  { rules: eslintConfigPrettier.rules },
]
