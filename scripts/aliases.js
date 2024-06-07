// @ts-check
// these aliases are shared between rollup and eslint
import { readdirSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const resolveEntryForPkg = (/** @type {string} */ p) =>
  resolve(__dirname, `../packages/${p}/src/index.ts`);

const resolveTypesEntryForPkg = (/** @type {string} */ p) =>
  resolve(__dirname, `../packages/${p}/types/index.d.ts`);

const dirs = readdirSync(new URL('../packages', import.meta.url));

/** @type {Record<string, string>} */
const entries = {
  xj: resolveEntryForPkg('xj'),
  // '@xj/types': resolveTypesEntryForPkg('xj'),
  // '@xj/utils': resolveEntryForPkg('utils'),
  // '@xj/utils/types': resolveTypesEntryForPkg('utils'),
};

const nonSrcPackages = [];

for (const dir of dirs) {
  const key = `@xj/${dir}`;
  if (
    dir !== 'xj' &&
    !nonSrcPackages.includes(dir) &&
    !(key in entries) &&
    statSync(new URL(`../packages/${dir}`, import.meta.url)).isDirectory()
  ) {
    entries[key] = resolveEntryForPkg(dir);
  }
}

export { entries };
