// @ts-check

// Using esbuild for faster dev builds.
// We are still using Rollup for production builds because it generates
// smaller files and provides better tree-shaking.

import esbuild from 'esbuild';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import minimist from 'minimist';
import { polyfillNode } from 'esbuild-plugin-polyfill-node';

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// resolve output
function dev(format, prod, inlineDeps, targets) {
  // esbuild.context({}).then(ctx => ctx.watch());
}
