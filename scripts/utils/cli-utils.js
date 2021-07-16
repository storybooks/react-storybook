/* eslint-disable global-require, no-octal-escape, @typescript-eslint/no-implied-eval */
const childProcess = require('child_process');

const logger = console;

const checkDependenciesAndRun = (run) => {
  let cooldown = 0;
  try {
    require('prompts');
    require('commander');
    require('chalk');
    require('npmlog');
  } catch (e) {
    logger.log('🕘 running build on a clean repo, we have to install dependencies');
    childProcess.spawnSync('yarn', ['install', '--ignore-optional'], {
      stdio: ['inherit', 'inherit', 'inherit'],
    });
    process.stdout.write('\x07');
    process.stdout.write('\033c');

    // give the filesystem some time
    cooldown = 1000;
  } finally {
    setTimeout(run, cooldown);
  }
};

const spawn = (command, options = {}) => {
  const out = childProcess.spawnSync(`${command}`, {
    shell: true,
    stdio: 'inherit',
    ...options,
  });

  if (out.status !== 0) {
    process.exit(out.status);
  }

  return out;
};

module.exports = {
  checkDependenciesAndRun,
  spawn,
};
