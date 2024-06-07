import { entries } from './scripts/aliases.js';

import eslintPlugin from 'eslint-plugin-eslint-plugin';
import globals from 'globals';
import eslintJs from '@eslint/js';
import eslintTs from 'typescript-eslint';
// import tsEslint from '@typescript-eslint/eslint-plugin';
import eslintPluginNoFunctionDeclareAfterReturn from 'eslint-plugin-no-function-declare-after-return';
import eslintImportResolverAlias from 'eslint-import-resolver-alias';
// import eslintPluginBabel from 'eslint-plugin-babel';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default eslintTs.config(
  {
    ignores: [
      '**/dist/',
      '**/node_modules/',
      '**/tests/',
      '**/examples/',
      '**/docs/',
      '**/scripts/',
      '**/temp/',
      '**/*.config.*',
      '**/*.js',
    ],
  },
  // 用于检查 ESLint 插件的 ESLint 插件
  eslintPlugin.configs['flat/recommended'],
  {
    rules: {
      'eslint-plugin/require-meta-docs-description': 'error',
    },
  },

  // Include global settings
  { languageOptions: { globals: globals.browser } },

  // Include the recommended JS configuration from eslint-plugin-js
  eslintJs.configs.recommended,

  // Include the recommended TypeScript configuration from eslint-plugin-typescript
  ...eslintTs.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 防止在返回语句后声明函数
  {
    plugins: {
      'no-function-declare-after-return':
        eslintPluginNoFunctionDeclareAfterReturn,
    },
    rules: {
      'no-function-declare-after-return/no-function-declare-after-return': 2,
    },
  },

  // Import alias resolver
  {
    plugins: { 'import-resolver-alias': eslintImportResolverAlias },
    settings: {
      'import/resolver': {
        alias: {
          map: Object.entries(entries),
          extensions: ['.ts', '.js', '.json'],
        },
      },
    },
  },

  // Include prettier configurations and plugin
  // 关闭所有不必要的或可能与Prettier冲突的规则
  eslintConfigPrettier,

  // Your custom configuration
  // 将Prettier作为ESLint规则运行，并将差异报告为单独的 ESLint 问题
  eslintPluginPrettierRecommended,
);
