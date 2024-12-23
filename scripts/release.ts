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
import { confirm } from '@inquirer/prompts'
import { upgradeVersion } from './upgradeVersion'

async function main() {
  try {
    await confirmPr()
  } catch (error) {
    log(log.super.red('x'), `release abort.\n`, error)
    return
  }

  log.blue('release started...')
  try {
    const packagePaths = Object.keys(packages)

    for (const pkgPath of packagePaths) {
      await buildPackage(pkgPath)
    }

    const path = createNpmPublishScript(packagePaths)

    try {
      execSync(`powershell -ExecutionPolicy Bypass -File ${path}`, {
        stdio: 'inherit'
      })

      log.green('✓ release completed successfully.')
    } catch (error) {
      log(log.super.red('x'), `npm publish failed.\n`, error)
    } finally {
      for (const pkgPath of packagePaths) {
        await restorePackage(pkgPath)
      }

      await upgradeVersion()
    }
  } catch (error) {
    log(log.super.red('x'), `release failed:\n`, error)
  } finally {
    log.blue('release done.')
  }
}

main()

/**
 * 将要发布的包的依赖替换为正确的版本号
 * @param pkgPath 包的文件夹名
 */
async function buildPackage(pkgPath: keyof typeof packages) {
  const pkg = packages[pkgPath].package
  toTemp(
    `dependencies.${pkgPath}.json`,
    JSON.stringify(pkg.dependencies, null, 2)
  )
  const deps = Object.keys(pkg.dependencies).reduce((acc, key) => {
    const value =
      packages[packageNames[key]].package.version ?? pkg.dependencies[key]
    return { ...acc, [key]: value }
  }, {})
  pkg.dependencies = deps
  const packagePath = resolve(__dirname, `packages/${pkgPath}/package.json`)
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2))
}

/**
 * 恢复包的依赖
 * @param pkgPath 包的文件夹名
 */
async function restorePackage(pkgPath: keyof typeof packages) {
  const dependencies = fromTemp(`dependencies.${pkgPath}.json`)
  const pkg = packages[pkgPath].package
  const packagePath = resolve(__dirname, `packages/${pkgPath}/package.json`)
  pkg.dependencies = dependencies
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2))
}

/** 这是一个提示，要求发布前先进行pr */
async function confirmPr() {
  const answer = await confirm({
    message: 'Have you created a PR before publishing?'
  })

  if (!answer) {
    throw new Error(
      `为了获得正确的版本号, 需要在发布 npm 和包版本增量之前提交 PR 请求.`
    )
  }
}
