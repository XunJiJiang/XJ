/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { writeFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { __dirname, normalizePath } from './scripts/utils'

const joinTo = (...paths: string[]) =>
  normalizePath(resolve(__dirname, ...paths))

export function createViteConfig(packageName: string) {
  return defineConfig({
    build: {
      outDir: joinTo(`packages/${packageName}/dist`),
      lib: {
        entry: joinTo(`packages/${packageName}/index.ts`),
        name: packageName,
        formats: ['es', 'cjs'], // 指定生成 ESM 格式
        fileName: (format) => {
          if (format === 'es') {
            return `index.esm-bundler.js` // 生成 ESM Bundler 文件
          } else if (format === 'cjs') {
            return `index.cjs.js` // 生成 CommonJS 文件
          }
          return `index.${format}.js`
        }
      }
    },
    resolve: {
      alias: {
        '@': joinTo(`packages/${packageName}/src`)
      }
    }
  })
}

export function createTsConfigDts(
  packageName: string,
  alias: Record<string, string> = {}
) {
  const tsconfigPath = joinTo(`temp/tsconfig.dts.${packageName}.json`)

  const outDir = `${__dirname}/packages/${packageName}/dist/types`

  const outFileEntry = outDir + '/index.d.ts'

  const tsconfig = `{
  "compilerOptions": {
    "declaration": true,
    "emitDeclarationOnly": true,
    "stripInternal": true,
    "composite": false,
    "outDir": "${outDir}",
    "target": "esnext",
    "module": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "paths": {
      ${Object.entries(alias)
        .map(([key, value]) => `"${key}": ["${value}"]`)
        .join(',\n')}
    },
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo"
  },
  "include": [
    "${__dirname}/packages/${packageName}/src/**/*",
    "${__dirname}/packages/${packageName}/env.d.ts",
    "${__dirname}/packages/${packageName}/index.ts",
    "${__dirname}/packages/${packageName}/env.d.ts"
  ],
  "exclude": [
    "${__dirname}/**/__tests__/*",
    "${__dirname}/**/__mocks__/*",
    "${__dirname}/**/*.test.*"
  ]
}
`

  if (!existsSync(joinTo('temp'))) {
    execSync('mkdir temp')
  }

  writeFileSync(tsconfigPath, tsconfig)

  return [tsconfigPath, outFileEntry]
}
