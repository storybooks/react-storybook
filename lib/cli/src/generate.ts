import program from 'commander';
import path from 'path';
import chalk from 'chalk';
import envinfo from 'envinfo';
import leven from 'leven';
import { sync } from 'read-pkg-up';
import initiate from './initiate';
import { add } from './add';
import { migrate } from './migrate';
import { extract } from './extract';
import { upgrade } from './upgrade';
import { repro } from './repro';
import { link } from './link';

const pkg = sync({ cwd: __dirname }).packageJson;

const logger = console;

program
  .command('init')
  .description('Initialize Storybook into your project.')
  .option('-f --force', 'Force add Storybook')
  .option('-s --skip-install', 'Skip installing deps')
  .option('-N --use-npm', 'Use npm to install deps')
  .option('-p --parser <babel | babylon | flow | ts | tsx>', 'jscodeshift parser')
  .option('-t --type <type>', 'Add Storybook for a specific project type')
  .option('--story-format <csf | csf-ts | mdx >', 'Generate stories in a specified format')
  .option('-y --yes', 'Answer yes to all prompts')
  .option('-b --builder <builder>', 'Builder library')
  .option('-l --linkable', 'Prepare installation for link (contributor helper)')
  .action((options) => initiate(options, pkg));

program
  .command('add <addon>')
  .description('Add an addon to your Storybook')
  .option('-N --use-npm', 'Use NPM to build the Storybook server')
  .option('-s --skip-postinstall', 'Skip package specific postinstall config modifications')
  .action((addonName, options) => add(addonName, options));

program
  .command('upgrade')
  .description('Upgrade your Storybook packages to the latest')
  .option('-N --use-npm', 'Use NPM to build the Storybook server')
  .option('-n --dry-run', 'Only check for upgrades, do not install')
  .option('-p --prerelease', 'Upgrade to the pre-release packages')
  .option('-s --skip-check', 'Skip postinstall version consistency checks')
  .action((options) => upgrade(options));

program
  .command('info')
  .description('Prints debugging information about the local environment')
  .action(() => {
    logger.log(chalk.bold('\nEnvironment Info:'));
    envinfo
      .run({
        System: ['OS', 'CPU'],
        Binaries: ['Node', 'Yarn', 'npm'],
        Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
        npmPackages: '@storybook/*',
        npmGlobalPackages: '@storybook/*',
      })
      .then(logger.log);
  });

program
  .command('migrate [migration]')
  .description('Run a Storybook codemod migration on your source files')
  .option('-l --list', 'List available migrations')
  .option('-g --glob <glob>', 'Glob for files upon which to apply the migration', '**/*.js')
  .option('-p --parser <babel | babylon | flow | ts | tsx>', 'jscodeshift parser')
  .option(
    '-n --dry-run',
    'Dry run: verify the migration exists and show the files to which it will be applied'
  )
  .option(
    '-r --rename <from-to>',
    'Rename suffix of matching files after codemod has been applied, e.g. ".js:.ts"'
  )
  .action((migration, { configDir, glob, dryRun, list, rename, parser }) => {
    migrate(migration, { configDir, glob, dryRun, list, rename, parser, logger }).catch((err) => {
      logger.error(err);
      process.exit(1);
    });
  });

program
  .command('extract [location] [output]')
  .description('extract stories.json from a built version')
  .action((location = 'storybook-static', output = path.join(location, 'stories.json')) =>
    extract(location, output).catch((e) => {
      logger.error(e);
      process.exit(1);
    })
  );

program
  .command('repro [outputDirectory]')
  .description('Create a reproduction from a set of possible templates')
  .option('-f --framework <framework>', 'Filter on given framework')
  .option('-t --template <template>', 'Use the given template')
  .option('-l --list', 'List available templates')
  .option('-g --generator <generator>', 'Use custom generator command')
  .option('--pnp', "Use Yarn Plug'n'Play mode instead of node_modules one")
  .option('--e2e', 'Used in e2e context')
  .action((outputDirectory, { framework, template, list, e2e, generator, pnp }) =>
    repro({ outputDirectory, framework, template, list, e2e, generator, pnp }).catch((e) => {
      logger.error(e);
      process.exit(1);
    })
  );

program
  .command('link <repo-url-or-directory>')
  .description('Pull down a repro from a URL (or a local directory), link it, and run storybook')
  .option('--local', 'Link a local directory already in your file system')
  .action((target, { local }) =>
    link({ target, local }).catch((e) => {
      logger.error(e);
      process.exit(1);
    })
  );

program.on('command:*', ([invalidCmd]) => {
  logger.error(' Invalid command: %s.\n See --help for a list of available commands.', invalidCmd);
  // eslint-disable-next-line no-underscore-dangle
  const availableCommands = program.commands.map((cmd) => cmd._name);
  const suggestion = availableCommands.find((cmd) => leven(cmd, invalidCmd) < 3);
  if (suggestion) {
    logger.log(`\n Did you mean ${suggestion}?`);
  }
  process.exit(1);
});

program.usage('<command> [options]').version(pkg.version).parse(process.argv);
