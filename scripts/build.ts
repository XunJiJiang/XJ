import { resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { build as viteBuild, type InlineConfig } from 'vite'
import { __dirname, log, packages } from './utils'
import { createViteConfig, createTsConfigDts } from '../vite.config'
import { readFileSync, writeFileSync, rmSync } from 'node:fs'

const args = process.argv.slice(2)

// 获取--p=参数, 如果没有则默认构建所有包
const dirNames = args
  .filter((arg) => arg.startsWith('--p='))
  .map((arg) => arg.replace('--p=', ''))

async function main() {
  log.blue('build started...')
  try {
    if (dirNames.length) {
      await build(dirNames)
    } else {
      await build(Object.keys(packages))
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

async function build(dirNames: (keyof typeof packages)[]) {
  log.blue(`building ${dirNames}...`)
  // try {
  //   await buildJs(dirNames)
  // } catch (error) {
  //   log.red('JavaScript build failed:')
  //   log.red(error)
  // }
  // try {
  //   await buildDts(dirNames)
  // } catch (error) {
  //   log.red('TypeScript build failed:')
  //   log.red(error)
  // }
  const configs = createViteConfig(dirNames)
  const dtsConfigs = createTsConfigDts(dirNames)
  for await (const [config, tsconfig, dirName] of configs.map<
    [InlineConfig, [string, string], string]
  >((config, index) => [config, dtsConfigs[index], dirNames[index]])) {
    try {
      await buildConfig(config, tsconfig, dirName)
    } catch (error) {
      log.red('Build failed:')
      log.red(error)
    }
  }
}

async function buildConfig(
  config: InlineConfig,
  [configPath, outFileEntry]: [string, string],
  dirName: string
) {
  try {
    log.blue(`running vite build ${dirName}...`)
    await viteBuild(config)
    log.green(`✓ vite build completed.`)
  } catch (error) {
    log(log.super.red('x'), `vite build failed:`)
    log(error)
  }

  try {
    log.blue(`running tsc build ${dirName} dts...`)
    execSync(`npx tsc -b ${configPath}`, { stdio: 'inherit' })
    log.green(`✓ tsc build completed.`)
  } catch (error) {
    log(log.super.red('x'), `tsc build failed:`)
    log(error)
  }

  try {
    const oldName = outFileEntry.replace(`${dirName}.d.ts`, 'index.d.ts')
    const content =
      `/// <reference path="../../env.d.ts" />\n` + readFileSync(oldName)
    writeFileSync(outFileEntry, content)
    rmSync(oldName)
  } catch (error) {
    log(log.super.red('x'), `Add reference path failed:`)
    log(error)
  }
}

async function buildJs(dirNames: (keyof typeof packages)[]) {
  const config = createViteConfig(dirNames)
  for await (const options of config) {
    await viteBuild(options)
  }
}

async function buildDts(dirNames: string[]) {
  const configs = createTsConfigDts(dirNames)

  for (const [configPath, outFileEntry] of configs) {
    // await viteBuild(config)

    try {
      execSync(`npx tsc -b ${configPath}`, { stdio: 'inherit' })
    } catch (error) {
      log.red('tsc build failed:')
      log.red(error)
    }
  }

  dirNames.forEach((dir) => {
    try {
      const dtsFile = resolve(
        __dirname,
        `../packages/${dir}/dist/types/${dir}.d.ts`
      )
      const content =
        `/// <reference path="../../env.d.ts" />\n` + readFileSync(dtsFile)
      writeFileSync(dtsFile, content)
    } catch (error) {
      log.red('Add reference path failed:')
      log.red(error)
    }
  })
}
