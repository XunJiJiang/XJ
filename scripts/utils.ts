import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk, { type ChalkInstance } from 'chalk'

export const __dirname = normalizePath(
  join(dirname(fileURLToPath(import.meta.url)), '..')
)

export function normalizePath(path: string) {
  return path.replace(/\/{2,}/g, '/').replace(/\\/g, '/')
}

const _require = createRequire(import.meta.url)

export const require = (path: string) => _require(join('..', path))

export function toTemp(file: string, content: string) {
  const temp = resolve(__dirname, 'temp')
  if (!existsSync(temp)) {
    mkdirSync(temp)
  }
  const path = resolve(temp, file)
  writeFileSync(path, content)
  return path
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

/**
 *
 * @param packageNames 包的文件夹名
 */
export function createNpmPublishScript(
  packageNames: (keyof typeof packages)[]
) {
  const content =
    `$ErrorActionPreference = "Stop"\n` +
    `Write-Host "Logging in to npm..."\n` +
    `npm login\n` +
    `Write-Host "Building all packages..."\n` +
    `npx tsx ${__dirname}/scripts/build.ts${packageNames.reduce((p, c) => {
      return `${p} --p=${c}`
    }, '')}\n` +
    packageNames.reduce((p, c) => {
      return (
        p +
        `Write-Host "Publishing ${packages[c].packageName}..."\n` +
        `Push-Location -Path "packages/${c}"\n` +
        `try {\n` +
        `  npm publish --access public\n` +
        `} catch {\n` +
        `  Write-Host "Failed to publish ${packages[c].packageName}"\n` +
        '}\n' +
        `Pop-Location\n`
      )
    }, '') +
    `Write-Host "All packages have been published successfully!"\n`

  return toTemp('publish.ps1', content)
}

const handle: ProxyHandler<typeof console.log> = {
  apply(target, _, argArray) {
    target(...argArray)
  },
  // log.blue.bold('Hello') -> log(chalk.blue.bold('Hello'))
  get(target, prop: keyof ChalkInstance, receiver) {
    if (typeof prop === 'symbol') {
      return Reflect.get(target, prop, receiver)
    }
    if (prop in chalk && typeof chalk[prop] === 'function') {
      return new Proxy((...args) => {
        // @ts-ignore
        target(chalk[prop](...args))
      }, handle)
    } else if (prop.startsWith('#')) {
      return new Proxy((...args) => {
        target(chalk.hex(prop)(...args))
      }, handle)
    }
    return Reflect.get(target, prop, receiver)
  }
}

export const log = new Proxy(console.log, handle) as ChalkInstance
