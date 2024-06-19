// ts-check
import { execSync } from 'node:child_process'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { writeFileSync, readdirSync, statSync } from 'node:fs'
import csl from './csl.js'
import { input, checkbox, Separator } from '@inquirer/prompts'

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)), '../')

const require = createRequire(import.meta.url)

const DEPENDENCIES_NO_IN_THIS_PACKAGE = [['reflect-metadata', '^0.2.2']]

await run()

function createPackage(packageName, authorName, dependencies) {
  return {
    name: `@xj-fv/${packageName}`,
    version: '0.0.1',
    description: `The ${packageName} of the fast framework xj`,
    main: './src/index.ts',
    module: './src/index.ts',
    types: `./dist/${packageName}.d.ts`,
    files: ['dist', 'README.md', 'LICENSE'],
    exports: {
      '.': {
        import: './src/index.ts',
        types: `./dist/${packageName}.d.ts`,
      },
      './package.json': './package.json',
    },
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: ['xj'],
    author: authorName,
    license: 'MIT',
    dependencies,
  }
}

async function run() {
  const { name, dependencies } = await writePackage()

  await writeIndexTs(name)

  await updatePackagesJson(name)

  await updateTsconfigBuildBrowser(name)

  try {
    execSync(`node ${join(__dirname, './scripts/build-dts.js')} --update`, {
      stdio: 'inherit',
    })
  } catch (error) {
    csl.warn('dts build failed, please run `pnpm run build-dts` manually.')
  }

  csl.success(`Created package ${name} successfully.`)

  if (Object.keys(dependencies).length !== 0) {
    csl.info(`Please run \`pnpm install\` to install dependencies.`)
  }
}

async function writePackage() {
  const packageName = await enterPackageName()
  const authorName = await enterAuthorName()
  const dependencies = await chooseDependencies()

  const packageJson = JSON.stringify(
    createPackage(packageName, authorName, dependencies),
    null,
    2,
  )

  execSync(`mkdir ${join(__dirname, `packages/${packageName}/src`)}`, {
    stdio: 'inherit',
  })

  writeFileSync(
    join(__dirname, `packages/${packageName}/package.json`),
    packageJson,
  )

  return {
    name: packageName,
    author: authorName,
    dependencies,
  }
}

/**
 * @param {string} packageName
 */
async function writeIndexTs(packageName) {
  writeFileSync(
    join(__dirname, `packages/${packageName}/src/index.ts`),
    `export default function ${packageName.replace(/\-/g, '')}() {\n  // TODO: write code\n}\n`,
  )
}

async function updatePackagesJson(newPkgName) {
  const packagesJsonPath = join(__dirname, `packages/packages.json`)

  const packagesJson = require(packagesJsonPath)

  if (!packagesJson.packageNames) {
    packagesJson.packageNames = []
  }

  if (packagesJson.packageNames.includes(newPkgName)) {
    return
  }

  packagesJson.packageNames.push(newPkgName)

  writeFileSync(packagesJsonPath, JSON.stringify(packagesJson, null, 2))
}

async function updateTsconfigBuildBrowser(newPkgName) {
  const tsconfigJsonPath = join(__dirname, `./tsconfig.build-browser.json`)

  const tsconfigJson = require(tsconfigJsonPath)

  if (tsconfigJson.include.includes(`packages/${newPkgName}/src`)) {
    return
  }

  tsconfigJson.include.push(`packages/${newPkgName}/src`)

  writeFileSync(tsconfigJsonPath, JSON.stringify(tsconfigJson, null, 2))
}

async function enterPackageName() {
  const existingPackageNames = await getExistingPackageNames()

  return await input({
    message: 'Enter package name',
    validate(value) {
      if (value.length === 0) {
        return 'Please enter a package name'
      }
      if (value.includes(' ')) {
        return 'The package name cannot contain spaces'
      }
      if (existingPackageNames.includes(`@xj-fv/${value}`)) {
        return 'The package already exists'
      }
      if (value === 'xj') {
        return 'The package name cannot be "xj"'
      }
      return true
    },
  })
}

async function enterAuthorName() {
  return await input({
    message: 'Enter author name',
    default: 'XunJiJiang',
    validate(value) {
      if (value.length === 0) {
        return 'Please enter an author name'
      }
      return true
    },
  })
}

async function chooseDependencies() {
  const answer = await checkbox({
    message: 'Select packages',
    choices: await createOptionsOfChooseDependencies(),
  })

  const dependencies = {}

  for (const pkg of answer) {
    const [name, version] = JSON.parse(pkg)
    dependencies[name] = version
  }

  return dependencies
}

/**
 *
 * @returns {Promise<string[]>}
 */
async function getExistingPackageNames() {
  const packages = readdirSync(join(__dirname, 'packages'))
  const packageNames = []
  for (const pkg of packages) {
    if (
      statSync(join(__dirname, 'packages', pkg)).isDirectory() &&
      pkg !== 'xj'
    ) {
      try {
        const pkgJson = require(join(__dirname, `packages/${pkg}/package.json`))
        packageNames.push(pkgJson.name)
      } catch (error) {
        csl.error(error)
      }
    }
  }
  return packageNames
}

async function createOptionsOfChooseDependencies() {
  const existingPackageNames = await getExistingPackageNames()
  const options = []
  options.push(new Separator('-- external dependencies --'))
  for (const pkg of DEPENDENCIES_NO_IN_THIS_PACKAGE) {
    options.push({
      name: pkg[0],
      value: JSON.stringify(pkg),
    })
  }
  options.push(new Separator('-- internal dependencies --'))
  for (const pkg of existingPackageNames) {
    options.push({
      name: pkg,
      value: `["${pkg}", "workspace:^"]`,
    })
  }
  return options
}
