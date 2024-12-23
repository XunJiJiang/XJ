import { resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { build as viteBuild } from 'vite'
import { __dirname, log, packages } from './utils'
import { createViteConfig, createTsConfigDts } from '../vite.config.[package]'

const args = process.argv.slice(2)

// 获取--p=参数, 如果没有则默认构建所有包
const packageNames = args
  .filter((arg) => arg.startsWith('--p='))
  .map((arg) => arg.replace('--p=', ''))

async function main() {
  log.blue('build started...')
  try {
    if (packageNames.length) {
      for (const packageName of packageNames) {
        await build(packageName as keyof typeof packages)
      }
    } else {
      for (const packageName in packages) {
        await build(packageName as keyof typeof packages)
      }
    }
    log.green('build completed.')
  } catch (error) {
    log.red('build failed.')
    log.red(error)
  } finally {
    log.blue('build done.')
  }
}

main()

async function build(packageName: keyof typeof packages) {
  log.blue(`building ${packageName}...`)
  await buildJs(packageName)
  await buildDts(packageName, packages[packageName].alias)
}

async function buildJs(packageName: keyof typeof packages) {
  const config = createViteConfig(packageName)
  await viteBuild({
    ...config
  })
}

async function buildDts(
  packageName: string,
  alias: Record<string, string> = {}
) {
  const configPath = createTsConfigDts(packageName, alias)
  try {
    execSync(`npx tsc -b ${configPath}`, { stdio: 'inherit' })
  } catch (error) {
    log.red('TypeScript build failed:')
    log.red(error)
  }
}
