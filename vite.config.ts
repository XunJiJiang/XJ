/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/*
 * NOTE: 关于 core
 * core 文件夹内的买个文件夹都被视为一个独立的模块
 * 当使用引入同一模块内的文件时, 使用相对路径
 * 当引入其他模块内的文件时, 使用别名
 */

const joinTo = (...paths: string[]) => resolve(__dirname, ...paths)

export default defineConfig({
  resolve: {
    alias: {}
  },
  test: {
    coverage: {
      include: ['packages/**/*.ts'],
      exclude: ['packages/**/index.ts', '**/*.test.ts']
    }
  }
})
