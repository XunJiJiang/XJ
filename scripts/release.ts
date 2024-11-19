import {
  __dirname,
  packages,
  packageNames,
  toTemp,
  fromTemp,
  createNpmPublishScript,
  log
} from './utils'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { checkbox } from '@inquirer/prompts'

async function main() {
  log.blue('release started...')
  try {
    const packages = await selectPackages()

    for (const packageName of packages) {
      await buildPackage(packageName)
    }

    const path = createNpmPublishScript(packages)

    try {
      execSync(`powershell -ExecutionPolicy Bypass -File ${path}`, {
        stdio: 'inherit'
      })

      log.green('release completed successfully.')
    } catch (error) {
      log.red('npm publish failed.')
      log.red(error)
    } finally {
      for (const packageName of packages) {
        await restorePackage(packageName)
      }

      for (const packageName of packages) {
        await upgradeVersion(packageName)
      }
    }
  } catch (error) {
    log.red('release failed.')
    log.red(error)
  } finally {
    log.blue('release done.')
  }
}

main()

/**
 * 将要发布的包的依赖替换为正确的版本号
 * @param packageName 包的文件夹名
 */
async function buildPackage(packageName: keyof typeof packages) {
  const pkg = packages[packageName].package
  toTemp(
    `dependencies.${packageName}.json`,
    JSON.stringify(pkg.dependencies, null, 2)
  )
  const deps = Object.keys(pkg.dependencies).reduce((acc, key) => {
    const value =
      packages[
        packageNames[key as keyof typeof packageNames] as keyof typeof packages
      ].package.version ?? pkg.dependencies[key]
    return { ...acc, [key]: value }
  }, {})
  pkg.dependencies = deps
  const packagePath = resolve(__dirname, `packages/${packageName}/package.json`)
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2))
}

/**
 * 恢复包的依赖
 * @param packageName 包的文件夹名
 */
async function restorePackage(packageName: keyof typeof packages) {
  const dependencies = fromTemp(`dependencies.${packageName}.json`)
  const pkg = packages[packageName].package
  const packagePath = resolve(__dirname, `packages/${packageName}/package.json`)
  pkg.dependencies = dependencies
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2))
}

async function selectPackages() {
  const choices = (Object.keys(packages) as (keyof typeof packages)[]).map(
    (key) => ({
      name: key,
      value: key
    })
  )

  const answer = await checkbox({
    message: 'Select packages to publish',
    choices
  })

  return answer
}

/**
 * 升级包的版本号 x.x.[x+1]
 * @param packageName 包的文件夹名
 */
async function upgradeVersion(packageName: keyof typeof packages) {
  const pkg = packages[packageName].package
  const version = pkg.version.split('.')
  version[2] = (parseInt(version[2]) + 1).toString()
  pkg.version = version.join('.')
  writeFileSync(
    resolve(__dirname, `packages/${packageName}/package.json`),
    JSON.stringify(pkg, null, 2)
  )
}
