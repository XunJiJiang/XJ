import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {'shared' | 'xj'} Target
 */

/**
 * @typedef {'packages-dist' | 'root-dist'} OutputPath
 */

const __dirname = resolve(dirname(fileURLToPath(import.meta.url)), '../');

const PACKAGES = ['shared', 'xj'];

const OUTPUT_PATH_MAP = {
  'packages-dist': target => `packages/${target}/dist/`,
  'root-dist': target => `dist/${target}/dist/`,
};

const OUTPUT_PATH = Object.keys(OUTPUT_PATH_MAP);

const OUTPUT_PATH_REGEX = {
  'packages-dist': /packages\/(.+)\/dist/,
  'root-dist': /dist\/(.+)\/dist/,
};

/**
 *
 * @param {string} outputPath
 * @returns {(target: string) => string}
 */
const specifyOutputPath = outputPath => {
  return OUTPUT_PATH_MAP[outputPath];
};

/**
 *
 * @param {string} outputPath
 * @param {string} target
 * @returns {string}
 */
function getOutputPath(outputPath, target) {
  return resolve(__dirname, specifyOutputPath(outputPath)(target));
}

export {
  PACKAGES,
  OUTPUT_PATH,
  OUTPUT_PATH_MAP,
  OUTPUT_PATH_REGEX,
  specifyOutputPath,
  getOutputPath,
};
