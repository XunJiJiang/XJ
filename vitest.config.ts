/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import { normalizePath } from './scripts/utils'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = normalizePath(dirname(fileURLToPath(import.meta.url)))

/*
 * NOTE: 关于 core
 * core 文件夹内的买个文件夹都被视为一个独立的模块
 * 当使用引入同一模块内的文件时, 使用相对路径
 * 当引入其他模块内的文件时, 使用别名
 */

const joinTo = (...paths: string[]) => resolve(__dirname, ...paths)

export function createVitestConfig(
  packageName: string,
  ignores: string[] = []
) {
  const exclude = [
    __dirname + '/packages/**/index.ts',
    __dirname + '/**/*.test.ts',
    'dist',
    'env.d.ts',
    ...ignores.map((packageName) => {
      return __dirname + `/packages/${packageName}/**/*`
    })
  ]
  return defineConfig({
    resolve: {
      alias: {
        '@test': joinTo('tests'),
        '@': joinTo(`packages/${packageName}/src`)
      }
    },
    test: {
      include: [__dirname + `/packages/${packageName}/src/**/*.ts`],
      exclude,
      coverage: {
        exclude
      }
    }
  })
}
