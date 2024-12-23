/// <reference types="vitest" />
import { resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { __dirname, normalizePath, packages } from './scripts/utils'

const joinTo = (...paths: string[]) =>
  normalizePath(resolve(__dirname, ...paths))

export default {}

export function createViteConfig(dirNames: string[]) {
  return dirNames.map((dirName) => {
    const banner = packages[dirName].banner
    return defineConfig({
      build: {
        target: 'esnext',
        outDir: joinTo(`packages/${dirName}/dist`),
        lib: {
          entry: joinTo(`packages/${dirName}/index.ts`),
          name: packages[dirName].packageName
        },
        minify: false,
        terserOptions: {
          parse: {},
          compress: false, // 禁用代码压缩
          mangle: false, // 禁用代码混淆
          format: {
            comments: true // 移除注释
          },
          sourceMap: {},
          keep_classnames: true,
          keep_fnames: true,
          ie8: false,
          module: false,
          safari10: false,
          toplevel: false
        },
        rollupOptions: {
          treeshake: false,
          external: ['@xj-fv/shared'],
          input: joinTo(`packages/${dirName}/index.ts`),
          output: [
            {
              format: 'commonjs',
              entryFileNames: `${dirName}.cjs.js`,
              dir: joinTo(`packages/${dirName}/dist`),
              exports: 'named',
              banner
            },
            {
              format: 'commonjs',
              entryFileNames: `${dirName}.cjs.prod.js`,
              dir: joinTo(`packages/${dirName}/dist`),
              exports: 'named',
              banner
            },
            {
              format: 'esm',
              entryFileNames: `${dirName}.esm-bundler.js`,
              dir: joinTo(`packages/${dirName}/dist`),
              exports: 'named',
              banner
            }
          ]
        },
        sourcemap: true
      },
      resolve: {
        alias: packages[dirName].alias
      }
    })
  })
}

export function createTsConfigDts(dirNames: string[]): [string, string][] {
  return dirNames.map((dirName) => {
    const tsconfigPath = joinTo(`temp/tsconfig.dts.${dirName}.json`)

    const outDir = joinTo(`packages/${dirName}/dist/types`)

    const outFileEntry = joinTo(
      `packages/${dirName}/dist/types/${dirName}.d.ts`
    )

    const tsconfig = `{
  "extends": "${joinTo('tsconfig.dts.json')}",
  "compilerOptions": {
    "rootDir": "${joinTo(`packages/${dirName}`)}",
    "outDir": "${outDir}",
    "paths": {
${Object.entries(packages[dirName].alias)
  .map(([key, value]) => `      "${key}/*": ["${value}/*"]`)
  .join(',\n')}
    }
  },
  "include": [
    "${joinTo(`packages/${dirName}/src`)}",
    "${joinTo(`packages/${dirName}/env.d.ts`)}",
    "${joinTo(`packages/${dirName}/index.ts`)}"
  ],
  "exclude": [
    "${joinTo(`**/__tests__/*`)}",
    "${joinTo(`**/__mocks__/*`)}",
    "${joinTo(`**/*.test.*`)}",
    // "node_modules",
    "dist"
  ]
}
`
    if (!existsSync(joinTo('temp'))) {
      execSync('mkdir temp')
    }

    writeFileSync(tsconfigPath, tsconfig)

    return [tsconfigPath, outFileEntry]
  })
}
