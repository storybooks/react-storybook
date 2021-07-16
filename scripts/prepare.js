/* eslint-disable no-console */
const path = require('path');
const shell = require('shelljs');
const chalk = require('chalk');
const fs = require('fs');
const log = require('npmlog');
const { babelify } = require('./utils/compile-babel');
const { tscfy } = require('./utils/compile-tsc');

function getPackageJson(modulePath) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  return require(path.join(modulePath, 'package.json'));
}

function removeDist() {
  shell.rm('-rf', 'dist');
}

const ignore = [
  '__mocks__',
  '__snapshots__',
  '__testfixtures__',
  '__tests__',
  '/tests/',
  /.+\.test\..+/,
];

function cleanup() {
  // remove files after babel --copy-files output
  // --copy-files option doesn't work with --ignore
  // https://github.com/babel/babel/issues/6226
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    const isInStorybookCLIPackage = process.cwd().includes(path.join('lib', 'cli'));
    const filesToRemove = shell.find('dist').filter((filePath) => {
      // Do not remove folder
      // And do not clean anything for:
      // - @storybook/cli/dist/(esm|cjs)/generators/**/template*
      // - @storybook/cli/dist/(esm|cjs)/frameworks/*
      // because these are the template files that will be copied to init SB on users' projects

      if (
        fs.lstatSync(filePath).isDirectory() ||
        (isInStorybookCLIPackage &&
          /\/(esm|cjs)\/(generators\/.+\/template|frameworks).*/.test(filePath))
      ) {
        return false;
      }

      // Remove all copied TS files (but not the .d.ts)
      if (/\.tsx?$/.test(filePath) && !/\.d\.ts$/.test(filePath)) {
        return true;
      }

      return ignore.reduce((acc, pattern) => acc || !!filePath.match(pattern), false);
    });
    if (filesToRemove.length) {
      shell.rm('-f', ...filesToRemove);
    }
  }
}

function logError(type, packageJson, errorLogs) {
  log.error(`FAILED (${type}) : ${errorLogs}`);
  log.error(
    `FAILED to compile ${type}: ${chalk.bold(`${packageJson.name}@${packageJson.version}`)}`
  );
}

const modulePath = path.resolve('./');
const packageJson = getPackageJson(modulePath);
const modules = true;

async function prepare() {
  removeDist();

  await babelify({
    modules,
    errorCallback: (errorLogs) => logError('js', packageJson, errorLogs),
  });
  tscfy({ errorCallback: (errorLogs) => logError('ts', packageJson, errorLogs) });

  cleanup();
  console.log(chalk.gray(`Built: ${chalk.bold(`${packageJson.name}@${packageJson.version}`)}`));
}

prepare();
