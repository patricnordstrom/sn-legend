const path = require('path');
const fs = require('fs-extra');

const EXTENSION_NAME = 'Legend chart';
const ONEDRIVE_FOLDER = 'OneDrive - QlikTech Inc';

function copyExt() {
  const target = path.resolve(
    process.env.USERPROFILE || require('os').homedir(),
    ONEDRIVE_FOLDER,
    'Documents',
    'Qlik',
    'Sense',
    'Extensions',
    EXTENSION_NAME
  );

  fs.copySync(path.resolve(process.cwd(), 'sn-legend-ext'), target);
  console.log(`Copied into Extensions folder: ${target}`);
}

if (require.main === module) {
  copyExt();
}

module.exports = copyExt;
