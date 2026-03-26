#! /usr/bin/env node

const yargs = require('yargs');
const fs = require('fs-extra');
const path = require('path');
const build = require('@nebula.js/cli-build');
const sense = require('@nebula.js/cli-sense');
const copyExt = require('./copy-ext');

const args = yargs(process.argv.slice(2)).argv;
const buildExt = args.ext;
const buildCore = args.core;
const mode = args.mode || 'production';
const watch = args.w;
const sourcemap = mode !== 'production';

// cleanup old build
fs.removeSync(path.resolve(process.cwd(), 'dist'));
fs.removeSync(path.resolve(process.cwd(), 'core/esm'));

const buildArgs = {};

const buildExtension = async () => {
  console.log('---> BUILDING EXTENSION');
  await sense({ output: 'sn-legend-ext', sourcemap });
  if (mode !== 'production') {
    console.log('---> COPYING EXTENSION');
    copyExt();
  }
};

if (buildCore) {
  buildArgs.core = 'core';
}

if (mode === 'production') {
  buildArgs.sourcemap = false;
} else {
  buildArgs.mode = mode;
}

if (watch) {
  buildArgs.watch = true;
}

const main = async () => {
  try {
    console.log('---> BUILDING SUPERNOVA');
    const watcher = await build(buildArgs);

    if (buildExt) {
      buildExtension();
      if (watch) {
        watcher.on('event', (event) => {
          event.code === 'BUNDLE_END' && buildExtension();
        });
      }
    }
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

main();
