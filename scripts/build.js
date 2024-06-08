// @ts-check
import ts from 'typescript';
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
// import fs from 'node:fs';
import { rollup } from 'rollup';
import csl from './csl.js';
import clean from './clean.js';
import { PACKAGES } from './packages.js';
import { buildDts } from './build-dts.js';
import {
  createConfig,
  // createProductionConfig,
  // createMinifiedConfig,
} from '../rollup.config.mjs';
import { specifyOutputPath } from './packages.js';

const rootPath = specifyOutputPath('root-dist');

const require = createRequire(import.meta.url);

const __dirname = path.resolve();
const packagesDir = path.resolve(__dirname, 'packages');
/**
 *
 * @param {string} p - package name
 * @returns
 */
const resolve = p => path.resolve(packagesDir, p);

clean(['all']);

await buildDts();

await compileTs();

const rollupConfigs = [];

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
  );
}

await rollupBuild(rollupConfigs);

await createPackages(PACKAGES);

csl.success('Rollup build completed successfully.');

/**
 * 编译 typescript, 主要是为了编译 reflect-metadata 和实验性装饰器
 */
async function compileTs() {
  csl.info('Start building typescript...');
  // 读取 tsconfig.json 路径
  const configPath = ts.findConfigFile(
    path.resolve(__dirname),
    ts.sys.fileExists,
    'tsconfig.json',
  );

  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  // 解析 tsconfig.json
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  // 解析config
  const configParseResult = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath),
  );

  const program = ts.createProgram(
    configParseResult.fileNames,
    configParseResult.options,
  );

  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start || 0,
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n',
      );
      csl.error(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`,
      );
    } else {
      csl.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    }
  });

  const exitCode = emitResult.emitSkipped ? 1 : 0;

  if (exitCode !== 0) {
    csl.error(`Typescript build process error with code '${exitCode}'.`);
    process.exit(exitCode);
  } else {
    csl.success('tsc build completed successfully.');
  }
}

/**
 * 运行单个配置
 * @param {import('rollup').RollupOptions} config
 */
async function rollupBuildSingle(config) {
  if (!config.output) {
    csl.warn(`No output configuration found: ${config}`);
    return;
  }

  if (!Array.isArray(config.output)) {
    config.output = [config.output];
  }

  if (Array.isArray(config.input)) {
    csl.error(`Multiple inputs are not supported: ${config.input}`);
    csl.error(`Please use a single input file.`);
    csl.error(
      `If you want to build multiple files, use multiple rollup.config.`,
    );
    process.exit(1);
  }

  const bundle = await rollup(config);

  for (const output of config.output) {
    const outputRes = await bundle.write(output);
    const outputDir =
      output.file || (output.dir ?? '') + '/' + (output.entryFileNames ?? '');

    csl.info(
      `${csl.createBold(`./${config.input}`)} → ${csl.createBold(`./${outputDir}`)}`,
    );
  }
}

/**
 * 构建
 * @param {import('rollup').RollupOptions[]} configs
 */
async function rollupBuild(configs) {
  csl.info('Start building...');
  try {
    for (const config of configs) {
      await rollupBuildSingle(config);
    }
  } catch (error) {
    csl.error(`Build failed with error: ${error}`);
    process.exit(1);
  }
}

/**
 *
 * @param {string} target
 */
async function createPackage(target) {
  const pkg = require(resolve(`${target}/package.json`));

  const packageDir = resolve(target);

  const outputDir = path.resolve(__dirname, 'dist', target);

  pkg.main = `./dist/${target}.cjs.js`;
  pkg.module = `./dist/${target}.esm-bundler.js`;
  pkg.types = `./dist/${target}.d.ts`;
  pkg.files = ['dist', 'README.md', 'LICENSE'];
  pkg.exports = {
    '.': {
      require: pkg.main,
      import: pkg.module,
      types: pkg.types,
    },
    './package.json': './package.json',
  };

  fs.writeFileSync(
    path.resolve(outputDir, 'package.json'),
    JSON.stringify(pkg, null, 2),
  );

  csl.info(`Created package.json for ${target}.`);

  try {
    fs.copyFileSync(
      path.resolve(packageDir, 'README.md'),
      path.resolve(outputDir, 'README.md'),
    );

    csl.info(`Copied README.md for ${target}.`);
  } catch (error) {}

  try {
    fs.copyFileSync(
      path.resolve(__dirname, 'LICENSE'),
      path.resolve(outputDir, 'LICENSE'),
    );

    csl.info(`Copied LICENSE for ${target}.`);
  } catch (error) {}
}

/**
 *
 * @param {string[]} targets
 */
async function createPackages(targets) {
  for (const target of targets) {
    await createPackage(target);
  }
}
