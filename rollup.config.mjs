// @ts-check
// import { defineConfig } from 'rollup';
import esbuild from 'rollup-plugin-esbuild';
import csl from './scripts/csl.js';
import { entries } from './scripts/aliases.js';
import path from 'node:path';
import { createRequire } from 'node:module';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import commonJS from '@rollup/plugin-commonjs';
import polyfillNode from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import { specifyOutputPath } from './scripts/packages.js';

/** @typedef {'cjs' | 'esm-bundler' | 'global' | 'esm-browser'} PackageFormat */
/**
 * @template T
 * @template {keyof T} K
 * @typedef { Omit<T, K> & Required<Pick<T, K>> } MarkRequired
 */
/** @typedef {MarkRequired<import('rollup').OutputOptions, 'file' | 'format'>} OutputOptions */

const require = createRequire(import.meta.url);

const __dirname = path.resolve();
const packagesDir = path.resolve(__dirname, 'packages');

const rootPath = specifyOutputPath('root-dist');

/**
 *
 * @param {string} p - package name
 * @returns
 */
const resolve = p => path.resolve(packagesDir, p);

const rootPkg = require(resolve(`../package.json`));

const masterVersion = rootPkg.version;

const unWarn = ['CIRCULAR_DEPENDENCY', 'THIS_IS_UNDEFINED'];

/**
 * @param {string} target
 * @returns {Record<PackageFormat, OutputOptions>}
 */
const outputConfigs = target => ({
  'esm-bundler': {
    file: `${rootPath(target)}${target}.esm-bundler.js`,
    format: 'esm',
  },
  'esm-browser': {
    file: `${rootPath(target)}${target}.esm-browser.js`,
    format: 'esm',
  },
  cjs: {
    file: `${rootPath(target)}${target}.cjs.js`,
    format: 'cjs',
  },
  global: {
    file: `${rootPath(target)}${target}.global.js`,
    format: 'iife',
  },
});

/**
 *
 * @param {string} target
 * @param {PackageFormat} format
 * @param {OutputOptions} output
 * @param {ReadonlyArray<import('rollup').Plugin>} plugins
 * @param {boolean} sourcemap
 * @returns {import('rollup').RollupOptions}
 */
function createConfig(target, format, output, plugins = [], sourcemap = false) {
  if (!output) {
    csl.yellow(`invalid format: "${format}"`);
    process.exit(1);
  }

  const pkg = require(resolve(`${target}/package.json`));

  const isBundlerESMBuild = /esm-bundler/.test(format);
  const isBrowserESMBuild = /esm-browser/.test(format);
  const isCJSBuild = format === 'cjs';
  const isGlobalBuild = /global/.test(format);
  const isCompatPackage = false;
  // const isCompatBuild = !!pkg.compat;
  // const isBrowserBuild =
  //   (isGlobalBuild || isBrowserESMBuild || isBundlerESMBuild) &&
  //   !pkg.enableNonBrowserBranches;

  output.banner = `/**
  * ${pkg.name} v${masterVersion}
  * (c) ${new Date().getFullYear()} ${pkg.author}
  * @license ${pkg.license}
  */`;

  output.exports = isCompatPackage ? 'auto' : 'named';
  if (isCJSBuild) {
    output.esModule = true;
  }
  output.sourcemap = sourcemap;
  output.externalLiveBindings = false;
  output.reexportProtoFromExternal = false;
  if (isGlobalBuild) {
    output.name = pkg.name;
  }

  let entryFile = `src/${target}.js`;

  if (isCompatPackage && (isBrowserESMBuild || isBundlerESMBuild)) {
    entryFile = `src/esm-${target}.js`;
  }

  function resolveExternal() {
    const treeShakenDeps = [
      'source-map-js',
      '@babel/parser',
      'estree-walker',
      // 'entities/lib/decode.js',
    ];

    return [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      // for @vue/compiler-sfc / server-renderer
      ...['path', 'url', 'stream'],
      ...treeShakenDeps,
    ];
  }

  function resolveNodePlugins() {
    // we are bundling forked consolidate.js in compiler-sfc which dynamically
    // requires a ton of template engines which should be ignored.
    /** @type {ReadonlyArray<string>} */
    let cjsIgnores = [];
    // if (pkg.name === '@xj/shared') {}

    const nodePlugins =
      format === 'cjs' && Object.keys(pkg.devDependencies || {}).length
        ? [
            commonJS({
              sourceMap: false,
              ignore: cjsIgnores,
            }),
            ...(format === 'cjs' ? [] : [polyfillNode()]),
            nodeResolve(),
          ]
        : [];

    return nodePlugins;
  }

  return {
    input: `temp/packages/${target}/src/index.js`,
    external: resolveExternal(),
    output,
    plugins: [
      json({
        namedExports: false,
      }),
      alias({
        entries,
      }),
      esbuild({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        sourceMap: output.sourcemap,
        minify: false,
        target: isCJSBuild ? 'es2020' : 'es2016',
      }),
      resolveNodePlugins(),
      ...plugins,
    ],
    onwarn(warning, warn) {
      if (unWarn.includes(warning.code || '')) {
        return;
      }
      warn(warning);
    },
  };
}

// function createDevConfig(name, /** @type {PackageFormat} */ format) {
//   return createConfig(name, format, {
//     file: resolve(`dist/${name}.${format}.dev.js`),
//     format: outputConfigs(name)[format].format,
//   });
// }

function createProductionConfig(target, /** @type {PackageFormat} */ format) {
  return createConfig(target, format, {
    file: resolve(`dist/${target}.${format}.prod.js`),
    format: outputConfigs(target)[format].format,
  });
}

function createMinifiedConfig(target, /** @type {PackageFormat} */ format) {
  return createConfig(
    target,
    format,
    {
      file: outputConfigs(target)[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs(target)[format].format,
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2016,
          pure_getters: true,
        },
        safari10: true,
      }),
    ],
  );
}

export {
  createConfig,
  createProductionConfig,
  createMinifiedConfig,
  outputConfigs,
};
