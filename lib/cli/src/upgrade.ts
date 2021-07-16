import { sync as spawnSync } from 'cross-spawn';
import semver from '@storybook/semver';
import { logger } from '@storybook/node-logger';
import { JsPackageManagerFactory } from './js-package-manager';
import { commandLog } from './helpers/commandLog';

type Package = {
  package: string;
  version: string;
};

const versionRegex = /(@storybook\/[^@]+)@(\S+)/;
export const getStorybookVersion = (line: string) => {
  if (line.startsWith('npm ')) return null;
  const match = versionRegex.exec(line);
  if (!match || !semver.clean(match[2])) return null;
  return {
    package: match[1],
    version: match[2],
  };
};

const excludeList = [
  '@storybook/linter-config',
  '@storybook/design-system',
  '@storybook/ember-cli-storybook',
  '@storybook/semver',
  '@storybook/eslint-config-storybook',
  '@storybook/bench',
  '@storybook/addon-bench',
  '@storybook/addon-console',
  '@storybook/csf',
  '@storybook/storybook-deployer',
];
export const isCorePackage = (pkg: string) =>
  pkg.startsWith('@storybook/') &&
  !pkg.startsWith('@storybook/preset-') &&
  !excludeList.includes(pkg);

const deprecatedPackages = [
  {
    minVersion: '6.0.0-alpha.0',
    url: 'https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#60-deprecations',
    deprecations: [
      '@storybook/addon-notes',
      '@storybook/addon-info',
      '@storybook/addon-contexts',
      '@storybook/addon-options',
      '@storybook/addon-centered',
    ],
  },
];

const formatPackage = (pkg: Package) => `${pkg.package}@${pkg.version}`;

const warnPackages = (pkgs: Package[]) =>
  pkgs.forEach((pkg) => logger.warn(`- ${formatPackage(pkg)}`));

export const checkVersionConsistency = () => {
  const lines = spawnSync('npm', ['ls'], { stdio: 'pipe' }).output.toString().split('\n');
  const storybookPackages = lines
    .map(getStorybookVersion)
    .filter(Boolean)
    .filter((pkg) => isCorePackage(pkg.package));
  if (!storybookPackages.length) {
    logger.warn('No storybook core packages found.');
    logger.warn(`'npm ls | grep storybook' can show if multiple versions are installed.`);
  }
  storybookPackages.sort((a, b) => semver.rcompare(a.version, b.version));
  const latestVersion = storybookPackages[0].version;
  const outdated = storybookPackages.filter((pkg) => pkg.version !== latestVersion);
  if (outdated.length > 0) {
    logger.warn(
      `Found ${outdated.length} outdated packages (relative to '${formatPackage(
        storybookPackages[0]
      )}')`
    );
    logger.warn('Please make sure your packages are updated to ensure a consistent experience.');
    warnPackages(outdated);
  }

  deprecatedPackages.forEach(({ minVersion, url, deprecations }) => {
    if (semver.gte(latestVersion, minVersion)) {
      const deprecated = storybookPackages.filter((pkg) => deprecations.includes(pkg.package));
      if (deprecated.length > 0) {
        logger.warn(`Found ${deprecated.length} deprecated packages since ${minVersion}`);
        logger.warn(`See ${url}`);
        warnPackages(deprecated);
      }
    }
  });
};

type Options = { prerelease: boolean; skipCheck: boolean; useNpm: boolean; dryRun: boolean };
export const upgrade = async ({ prerelease, skipCheck, useNpm, dryRun }: Options) => {
  const packageManager = JsPackageManagerFactory.getPackageManager(useNpm);

  commandLog(`Checking for latest versions of '@storybook/*' packages`);

  const flags = [];
  if (!dryRun) flags.push('--upgrade');
  flags.push('--target');
  flags.push(prerelease ? 'greatest' : 'latest');
  const check = spawnSync('npx', ['npm-check-updates', '/storybook/', ...flags], {
    stdio: 'pipe',
  }).output.toString();
  logger.info(check);

  if (!dryRun) {
    commandLog(`Installing upgrades`);
    packageManager.installDependencies();
  }

  if (!skipCheck) checkVersionConsistency();
};
