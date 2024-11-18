import { __dirname, packages, packageNames, toTemp, fromTemp } from './utils'
import { resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

async function main() {
  try {
    await buildPackage('xj')
    await buildPackage('shared')

    // 运行npm-publish.sh
    execSync(
      `powershell -ExecutionPolicy Bypass -File ${__dirname}/npm-publish.ps1`,
      { stdio: 'inherit' }
    )

    await restorePackage('xj')
    await restorePackage('shared')
    console.log('Build completed successfully.')
  } catch (error) {
    console.error('Build failed:', error)
  }
}

main()

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
      ].package.version
    return { ...acc, [key]: value }
  }, {})
  pkg.dependencies = deps
  const packagePath = resolve(__dirname, `packages/${packageName}/package.json`)
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2))
}

async function restorePackage(packageName: keyof typeof packages) {
  const dependencies = fromTemp(`dependencies.${packageName}.json`)
  const pkg = packages[packageName].package
  const packagePath = resolve(__dirname, `packages/${packageName}/package.json`)
  pkg.dependencies = dependencies
  writeFileSync(packagePath, JSON.stringify(pkg, null, 2))
}
