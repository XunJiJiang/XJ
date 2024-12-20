import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { select } from '@inquirer/prompts'
import { log, packages, requireFromRoot, __dirname } from './utils'

type Version = `${number}.${number}.${number}`

async function main() {
  await upgradeVersion()
}

main()

export async function upgradeVersion() {
  log.blue('upgrade version started...')
  const lastVersion = getLastVersion()
  log.blue(`current version: ${lastVersion}`)
  const nextVersion = await selectVersionType(lastVersion)
  log.blue(`next version: ${nextVersion}`)
  updateVersion(nextVersion)
  log.green('✓ upgrade version completed successfully.')
}

/**
 * 获取当前版本号
 */
function getLastVersion() {
  try {
    return requireFromRoot('package.json').version
  } catch (error) {
    log(log.super.red('x'), `get version failed.\n`, error)
  }
}

/**
 * 选择要升级的版本类型
 */
async function selectVersionType(version: Version) {
  const choices = version.split('.').map((v, i, o) => {
    const versions = [...o].map((v, j) => (j > i ? '0' : v))
    versions[i] = (parseInt(v) + 1).toString()
    const next = versions.join('.') as Version
    return {
      name: next,
      value: next
    }
  })

  const nextVersion = await select({
    message: '下一个版本',
    choices,
    default: choices[2].value
  })

  return nextVersion
}

/**
 * 更新版本号
 */
async function updateVersion(next: Version) {
  try {
    const pkg = requireFromRoot('package.json')
    pkg.version = next
    writeFileSync(
      resolve(__dirname, 'package.json'),
      JSON.stringify(pkg, null, 2) + '\n'
    )

    for (const key in packages) {
      const pkg = requireFromRoot(`packages/${key}/package.json`)
      pkg.version = next
      writeFileSync(
        resolve(__dirname, `packages/${key}/package.json`),
        JSON.stringify(pkg, null, 2) + '\n'
      )
    }
  } catch (error) {
    log(log.super.red('x'), `update version failed.\n`, error)
  }
}
