//ts-check
import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PACKAGES, OUTPUT_PATH, specifyOutputPath } from './packages.js';
import { rollup } from 'rollup';
import { createRollupDtsConfig } from '../rollup.dts.config.mjs';
import csl from './csl.js';

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)), '../');
const args = process.argv.slice(2);

await buildDts();

/**
 * @returns
 */
export async function buildDts() {
  if (!isCreateDts()) {
    return;
  }

  try {
    execSync('tsc -p tsconfig.build-browser.json', { stdio: 'inherit' });
    csl.success('tsc build-dts completed successfully.');
    const _args = args.filter(arg => OUTPUT_PATH.includes(arg));
    await rollupBuildDts(_args.length ? _args : OUTPUT_PATH);
    csl.success('Rollup build-dts completed successfully.');
  } catch (error) {}
}

/**
 *
 *  @param {string[]} outputPaths
 */
async function rollupBuildDts(outputPaths) {
  for (const outputPath of outputPaths) {
    if (!OUTPUT_PATH.includes(outputPath)) {
      continue;
    }

    for (const target of PACKAGES) {
      const rollupDtsConfig = createRollupDtsConfig(
        target,
        target => specifyOutputPath(outputPath)(target) + target + '.d.ts',
      );
      const bundle = await rollup(rollupDtsConfig);
      const outputRes = await bundle.write(rollupDtsConfig.output);
      csl.info(
        `${csl.createBold(rollupDtsConfig.input)} → ${csl.createBold(rollupDtsConfig.output.file)}`,
      );
    }
  }
}

function isCreateDts() {
  if (args.includes('--update') || args.includes('--force')) {
    return true;
  }
  if (args.includes('--dev:example') && isPackageDistDtsExist()) {
    csl.warn('dts files already exist. use --update or --force to overwrite.');
    return false;
  }
  if (
    args.includes('--cache') &&
    isPackageDistDtsExist() &&
    isRootDistDtsExist()
  ) {
    csl.warn('dts files already exist. use --update or --force to overwrite.');
    return false;
  }
  return true;
}

/**
 *
 * @returns {boolean}
 */
function isPackageDistDtsExist() {
  try {
    const packageDir = join(__dirname, 'packages');
    const packages = readdirSync(packageDir);
    for (const packageName of packages) {
      const distDir = join(packageDir, packageName, 'dist');
      const distFiles = readdirSync(distDir);
      if (distFiles.includes(`${packageName}.d.ts`)) {
        continue;
      } else {
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

function isRootDistDtsExist() {
  try {
    const distDir = join(__dirname, 'dist');
    const distFiles = readdirSync(distDir);
    for (const distFile of distFiles) {
      const distFilePath = join(distDir, distFile, 'dist');
      const dtsFiles = readdirSync(distFilePath);
      if (dtsFiles.includes(`${distFile}.d.ts`)) {
        continue;
      } else {
        return false;
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}
