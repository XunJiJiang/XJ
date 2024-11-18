import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const __dirname = normalizePath(
  join(dirname(fileURLToPath(import.meta.url)), '..')
)

export function normalizePath(path: string) {
  return path.replace(/\/{2,}/g, '/').replace(/\\/g, '/')
}

const _require = createRequire(import.meta.url)

export const require = (path: string) => _require(join('..', path))

export function toTemp(file: string, content: string) {
  // 检查temp文件夹是否存在
  const temp = resolve(__dirname, 'temp')
  if (!existsSync(temp)) {
    mkdirSync(temp)
  }
  const path = resolve(temp, file)
  writeFileSync(path, content)
}

export function fromTemp(file: string) {
  return require(join('temp', file))
}

export const packages = (() => {
  return {
    xj: {
      packageName: 'xj',
      package: require('packages/xj/package.json') as Record<string, any>,
      alias: {
        '@/*': normalizePath(resolve(__dirname, 'packages/xj/src')) + '/*'
        // '@xj-fv/shared/*':
        //   normalizePath(
        //     resolve(__dirname, 'packages/xj/node_modules/@xj-fv/shared')
        //   ) + '/*'
      }
    },
    shared: {
      packageName: '@xj-fv/shared',
      package: require('packages/shared/package.json') as Record<string, any>,
      alias: {
        '@/*': normalizePath(resolve(__dirname, 'packages/shared/src')) + '/*'
      }
    }
  }
})()

export const packageNames = Object.entries(packages).reduce(
  (acc, [key, value]) => ({ ...acc, [value.packageName]: key }),
  {}
)
