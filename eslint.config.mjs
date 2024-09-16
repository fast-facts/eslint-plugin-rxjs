import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import { resolve } from 'path';

export default tseslint.config(
  {
    files: ['**/*.ts'],

    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
    ],

    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',

      parserOptions: {
        project: resolve(import.meta.dirname, 'tsconfig.json')
      }
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
    },

    rules: {
      'constructor-super': ['error'],
      curly: ['error', 'all'],
      'default-case': ['error'],

      eqeqeq: ['error', 'always', {
        null: 'ignore',
      }],

      'guard-for-in': ['error'],
      'new-parens': ['error'],
      'no-bitwise': ['error'],
      'no-caller': ['error'],
      'no-cond-assign': ['error'],

      'no-console': ['warn', {
        allow: ['warn', 'error'],
      }],

      'no-debugger': ['error'],
      'no-eval': ['error'],
      'no-fallthrough': ['error'],
      'no-new-wrappers': ['error'],
      'no-sparse-arrays': ['error'],
      'no-template-curly-in-string': ['error'],
      'no-unsafe-finally': ['error'],
      'no-unused-expressions': ['warn'],
      'no-unused-labels': ['error'],
      'no-var': ['error'],
      'one-var': ['error', 'never'],
      'prefer-template': ['error'],
      radix: ['error'],

      'sort-keys': 'off',

      'use-isnan': ['error'],
      '@typescript-eslint/adjacent-overload-signatures': ['error'],

      '@typescript-eslint/array-type': ['error', {
        default: 'array',
        readonly: 'array',
      }],

      // '@typescript-eslint/ban-types': ['error', {
      //   extendDefaults: true,

      //   types: {
      //     object: false,
      //   },
      // }],

      // '@typescript-eslint/member-ordering': ['warn', {
      //   classes: {
      //     memberTypes: [
      //       'public-static-field',
      //       'protected-static-field',
      //       'private-static-field',
      //       'public-static-method',
      //       'protected-static-method',
      //       'private-static-method',
      //       'public-instance-field',
      //       'protected-instance-field',
      //       'private-instance-field',
      //       'public-abstract-field',
      //       'protected-abstract-field',
      //       'private-abstract-field',
      //       'public-constructor',
      //       'protected-constructor',
      //       'private-constructor',
      //       'public-instance-method',
      //       'protected-instance-method',
      //       'private-instance-method',
      //       'public-abstract-method',
      //       'protected-abstract-method',
      //       'private-abstract-method',
      //     ],

      //     order: 'alphabetically',
      //   },
      // }],

      '@typescript-eslint/naming-convention': ['warn', {
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        selector: 'variableLike',
        trailingUnderscore: 'allow',
      }, {
          format: ['PascalCase'],
          leadingUnderscore: 'allow',
          selector: 'typeLike',
          trailingUnderscore: 'allow',
        }],

      '@typescript-eslint/no-extra-non-null-assertion': ['error'],
      '@typescript-eslint/no-inferrable-types': ['warn'],
      '@typescript-eslint/no-invalid-this': ['error'],
      '@typescript-eslint/no-namespace': ['error'],
      '@typescript-eslint/no-non-null-asserted-optional-chain': ['error'],
      '@typescript-eslint/no-non-null-assertion': ['error'],
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': ['warn'],

      '@typescript-eslint/no-unused-vars': ['warn', {
        args: 'none',
        ignoreRestSiblings: true,
      }],

      '@typescript-eslint/prefer-for-of': ['warn'],
      '@typescript-eslint/prefer-nullish-coalescing': ['error'],

      '@typescript-eslint/require-array-sort-compare': ['error', {
        ignoreStringArrays: true,
      }],

      '@typescript-eslint/require-await': ['error'],
      '@typescript-eslint/return-await': ['error'],

      '@typescript-eslint/triple-slash-reference': ['error', {
        lib: 'never',
        path: 'never',
        types: 'never',
      }],
    }
  }
);