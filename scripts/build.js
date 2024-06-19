// @ts-check
// import ts from 'typescript';
import path, { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { rollup } from 'rollup';
import csl from './csl.js';
import clean from './clean.js';
import { PACKAGES } from './packages.js';
import { buildDts } from './build-dts.js';
import { createConfig } from '../rollup.config.mjs';
import { specifyOutputPath } from './packages.js';

const rootPath = specifyOutputPath('root-dist')

const require = createRequire(import.meta.url)

const __dirname = path.resolve(dirname(fileURLToPath(import.meta.url)), '../')

const PACKAGE_VERSION =
  require(join(__dirname, 'package.json')).version ?? '0.0.1'

const packagesDir = path.resolve(__dirname, 'packages')
/**
 *
 * @param {string} p - package name
 * @returns
 */
const resolve = p => path.resolve(packagesDir, p)

clean(['all'])

await buildDts()

await tsc()

const rollupConfigs = []

for (const target of PACKAGES) {
  rollupConfigs.push(
    createConfig(target, 'cjs', {
      file: `${rootPath(target)}${target}.cjs.js`,
      format: 'cjs',
    }),
    createConfig(target, 'esm-bundler', {
      file: `${rootPath(target)}${target}.esm-bundler.js`,
      format: 'esm',
    }),
  )
}

await rollupBuild(rollupConfigs)

await createPackages(PACKAGES)

csl.success('Rollup build completed successfully.')

/**
 * 编译 typescript, 主要是为了编译 reflect-metadata 和实验性装饰器
 */
async function tsc() {
  csl.info('Start building typescript...')

  try {
    execSync(`tsc -p ${join(__dirname, 'tsconfig.json')}`, {
      stdio: 'inherit',
    })
    csl.success('tsc build completed successfully.')
  } catch (error) {
    csl.error(`Typescript build process error.`)
  }
}

/**
 * 运行单个配置
 * @param {import('rollup').RollupOptions} config
 */
async function rollupBuildSingle(config) {
  if (!config.output) {
    csl.warn(`No output configuration found: ${config}`)
    return
  }

  if (!Array.isArray(config.output)) {
    config.output = [config.output]
  }

  if (Array.isArray(config.input)) {
    csl.error(`Multiple inputs are not supported: ${config.input}`)
    csl.error(`Please use a single input file.`)
    csl.error(
      `If you want to build multiple files, use multiple rollup.config.`,
    )
    process.exit(1)
  }

  const bundle = await rollup(config)

  for (const output of config.output) {
    const outputRes = await bundle.write(output)
    const outputDir =
      output.file || (output.dir ?? '') + '/' + (output.entryFileNames ?? '')

    csl.info(
      `${csl.createBold(`./${config.input}`)} → ${csl.createBold(`./${outputDir}`)}`,
    )
  }
}

/**
 * 构建
 * @param {import('rollup').RollupOptions[]} configs
 */
async function rollupBuild(configs) {
  csl.info('Start building...')
  try {
    for (const config of configs) {
      await rollupBuildSingle(config)
    }
  } catch (error) {
    csl.error(`Build failed with error: ${error}`)
    process.exit(1)
  }
}

/**
 *
 * @param {string} target
 */
async function createPackage(target) {
  const pkg = require(resolve(`${target}/package.json`))

  const packageDir = resolve(target)

  const outputDir = path.resolve(__dirname, 'dist', target)

  pkg.main = `./dist/${target}.cjs.js`
  pkg.module = `./dist/${target}.esm-bundler.js`
  pkg.types = `./dist/${target}.d.ts`
  pkg.files = ['dist', 'README.md', 'LICENSE']
  pkg.exports = {
    '.': {
      require: pkg.main,
      import: pkg.module,
      types: pkg.types,
    },
    './package.json': './package.json',
  }

  if (pkg.dependencies) {
    for (const key in pkg.dependencies) {
      if (pkg.dependencies[key] === 'workspace:*') {
        pkg.dependencies[key] = PACKAGE_VERSION + ''
      }
    }
  }

  fs.writeFileSync(
    path.resolve(outputDir, 'package.json'),
    JSON.stringify(pkg, null, 2),
  )

  csl.info(`Created package.json for ${target}.`)

  try {
    fs.copyFileSync(
      path.resolve(packageDir, 'README.md'),
      path.resolve(outputDir, 'README.md'),
    )

    csl.info(`Copied README.md for ${target}.`)
  } catch (error) {}

  try {
    fs.copyFileSync(
      path.resolve(__dirname, 'LICENSE'),
      path.resolve(outputDir, 'LICENSE'),
    )

    csl.info(`Copied LICENSE for ${target}.`)
  } catch (error) {}
}

/**
 *
 * @param {string[]} targets
 */
async function createPackages(targets) {
  for (const target of targets) {
    await createPackage(target)
  }
}
