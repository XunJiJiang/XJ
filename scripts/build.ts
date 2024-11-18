import { resolve } from 'node:path'
import { execSync } from 'node:child_process'
import { build as viteBuild } from 'vite'
import { __dirname, packages } from './utils'
import { createViteConfig, createTsConfigDts } from '../vite.config.[package]'

packages
async function build(packageName: keyof typeof packages) {
  await buildJs(packageName)
  await buildDts(packageName, packages[packageName].alias)
}

async function main() {
  try {
    await build('xj')
    await build('shared')
    console.log('Build completed successfully.')
  } catch (error) {
    console.error('Build failed:', error)
  }
}

main()

async function buildJs(packageName: keyof typeof packages) {
  const configPath = resolve(__dirname, `vite.config.${packageName}.ts`)

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
    // console.error('TypeScript build failed:', error)
  }
}
