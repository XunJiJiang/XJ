// @ts-check
import ts from 'typescript';
import path from 'path';
import { execSync } from 'child_process';
// import fs from 'fs';
import { rollup } from 'rollup';
import csl from './csl.js';
import {
  createConfig,
  createProductionConfig,
  createMinifiedConfig,
} from '../rollup.config.mjs';

const __dirname = path.resolve();

await buildDts();

await compileTs();

await rollupBuild([
  createConfig(
    'utils',
    'cjs',
    {
      file: 'packages/utils/dist/utils.js',
      format: 'cjs',
    },
    [],
    true,
  ),
  createConfig(
    'utils',
    'esm-bundler',
    {
      file: 'packages/utils/dist/utils.esm-bundler.js',
      format: 'esm',
    },
    [],
    true,
  ),
  createConfig(
    'xj',
    'cjs',
    {
      file: 'packages/xj/dist/xj.cjs.js',
      format: 'cjs',
    },
    [],
    true,
  ),
  createConfig(
    'xj',
    'esm-bundler',
    {
      file: 'packages/xj/dist/xj.esm-bundler.js',
      format: 'esm',
    },
    [],
    true,
  ),
]);

async function buildDts() {
  execSync(
    'tsc -p tsconfig.build-browser.json && rollup -c rollup.dts.config.mjs',
  );
}

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
    csl.success('Typescript build completed successfully');
  }
}

/**
 * 运行单个配置
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
    csl.error(`Please use a single input file`);
    csl.error(
      `If you want to build multiple files, use multiple rollup.config`,
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
  // finally {
  //   fs.rmdirSync('temp', { recursive: true });
  // }

  csl.success('All builds completed successfully');
}
