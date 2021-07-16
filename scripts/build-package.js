#!/usr/bin/env node

/* eslint-disable global-require */
const { resolve } = require('path');
const terminalSize = require('window-size');
const { checkDependenciesAndRun, spawn } = require('./utils/cli-utils');

const getStorybookPackages = () => {
  const listCommand = spawn(`lerna list`, {
    stdio: 'pipe',
  });

  const packages = listCommand.output
    .toString()
    .match(/@storybook\/(.)*/g)
    .sort();

  return packages;
};

function run() {
  const prompts = require('prompts');
  const program = require('commander');
  const chalk = require('chalk');
  const log = require('npmlog');

  log.heading = 'storybook';
  const prefix = 'build';
  log.addLevel('aborted', 3001, { fg: 'red', bold: true });

  const packages = getStorybookPackages();
  const packageTasks = packages
    .map((package) => ({
      name: package,
      suffix: package.replace('@storybook/', ''),
      defaultValue: false,
      helpText: `build only the ${package} package`,
    }))
    .reduce((acc, next) => {
      acc[next.name] = next;
      return acc;
    }, {});

  const tasks = {
    watch: {
      name: `watch`,
      defaultValue: false,
      suffix: '--watch',
      helpText: 'build on watch mode',
    },
    ...packageTasks,
  };

  const main = program.version('5.0.0').option('--all', `build everything ${chalk.gray('(all)')}`);

  Object.keys(tasks)
    .reduce((acc, key) => acc.option(tasks[key].suffix, tasks[key].helpText), main)
    .parse(process.argv);

  Object.keys(tasks).forEach((key) => {
    // checks if a flag is passed e.g. yarn build --@storybook/addon-docs --watch
    const containsFlag = program.rawArgs.includes(tasks[key].suffix);
    tasks[key].value = containsFlag || program.all;
  });

  let selection;
  let watchMode = false;
  if (
    !Object.keys(tasks)
      .map((key) => tasks[key].value)
      .filter(Boolean).length
  ) {
    selection = prompts([
      {
        type: 'toggle',
        name: 'mode',
        message: 'Start in watch mode',
        initial: false,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: 'autocompleteMultiselect',
        message: 'Select the packages to build',
        name: 'todo',
        hint:
          'You can also run directly with package name like `yarn build core`, or `yarn build --all` for all packages!',
        optionsPerPage: terminalSize.height - 3, // 3 lines for extra info
        choices: packages.map((key) => ({
          value: key,
          title: tasks[key].name || key,
          selected: (tasks[key] && tasks[key].defaultValue) || false,
        })),
      },
    ]).then(({ mode, todo }) => {
      watchMode = mode;
      return todo.map((key) => tasks[key]);
    });
  } else {
    // hits here when running yarn build --packagename
    watchMode = process.argv.includes('--watch');
    selection = Promise.resolve(
      Object.keys(tasks)
        .map((key) => tasks[key])
        .filter((item) => item.name !== 'watch' && item.value === true)
    );
  }

  selection
    .then((list) => {
      if (list.length === 0) {
        log.warn(prefix, 'Nothing to build!');
      } else {
        const packageNames = list
          // filters out watch command if --watch is used
          .map((key) => key.suffix)
          .filter(Boolean);

        let glob =
          packageNames.length > 1
            ? `@storybook/{${packageNames.join(',')}}`
            : `@storybook/${packageNames[0]}`;

        const isAllPackages = process.argv.includes('--all');
        if (isAllPackages) {
          glob = '@storybook/*';

          log.warn(
            'You are building a lot of packages on watch mode. This is an expensive action and might slow your computer down.\nIf this is an issue, run yarn build to filter packages and speed things up!'
          );
        }

        if (watchMode) {
          const runWatchMode = () => {
            const baseWatchCommand = `lerna exec --scope '${glob}' --parallel -- cross-env-shell node ${resolve(
              __dirname
            )}`;
            const watchTsc = `${baseWatchCommand}/utils/watch-tsc.js`;
            const watchBabel = `${baseWatchCommand}/utils/watch-babel.js`;
            const command = `concurrently --kill-others-on-fail "${watchTsc}" "${watchBabel}"`;

            spawn(command);
          };

          runWatchMode();
        } else {
          spawn(`lerna run prepare --scope "${glob}"`);
        }
        process.stdout.write('\x07');
      }
    })
    .catch((e) => {
      log.aborted(prefix, chalk.red(e.message));
      log.silly(prefix, e);
      process.exit(1);
    });
}

checkDependenciesAndRun(run);
