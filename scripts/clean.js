#!/usr/bin/env node
// @ts-check
import path from 'path';
import fs from 'fs';
import csl from './csl.js';

const __dirname = path.resolve();

const args = process.argv.slice(2);

const ignoreFiles = ['node_modules', '.git', '.vscode'];

const includes = ['all', 'dist', 'temp', 'node_modules'];

clear(args);

/**
 *
 * @param {string[]} targets
 */
function clear(targets) {
  if (targets[0] === 'all' || targets.length === 0) {
    deepRemove(__dirname, 'dist');
    deepRemove(__dirname, 'temp');
  } else {
    const _args = args.filter(arg => {
      if (includes.includes(arg)) {
        return true;
      } else {
        csl.warn(`Target ${arg} is not allowed to be deleted.`);
        return false;
      }
    });
    for (const arg of _args) {
      deepRemove(__dirname, arg);
    }
    csl.success('Cleaned complete.');
  }
}

/**
 *
 * @param {string} dir
 * @param {string} target
 */
function deepRemove(dir, target) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === target) {
      const _dir = path.resolve(dir, f);
      fs.rmSync(_dir, { recursive: true });
      csl.success(
        csl.createBold(
          `Removed ${_dir.replace(__dirname, '.').replace(/\\/g, '/')}`,
        ),
      );
    } else if (ignoreFiles.includes(f)) {
      continue;
    } else if (fs.statSync(path.resolve(dir, f)).isDirectory()) {
      deepRemove(path.resolve(dir, f), target);
    } else {
      continue;
    }
  }
}
