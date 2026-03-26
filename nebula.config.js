/* eslint import/no-dynamic-require: 0, class-methods-use-this: 0 */

const path = require('path');
const crypto = require('crypto');

const targetPkg = require(path.resolve(__dirname, './package.json'));

const versionHash = crypto
  .createHash('md5')
  .update(`${targetPkg.name}@${targetPkg.version}`)
  .digest('hex')
  .slice(0, 4);

const replacementStrings = {
  'process.env.VERSION_HASH': JSON.stringify(versionHash),
  'process.env.PACKAGE_VERSION': JSON.stringify(targetPkg.version),
};

module.exports = {
  build: {
    replacementStrings,
    systemjs: {
      external: [
        'react',
        'react-dom',
        'hammerjs',
        '@nebula.js/stardust',
        'picasso.js',
        'picasso-plugin-q',
        'qlik-chart-modules',
        'qlik-object-conversion',
      ],
    },
    inlineDynamic: true,
  },
  serve: {
    flags: {
      TLV_1804_DEFAULT_CHART_SETTINGS: true,
    },
  },
};
