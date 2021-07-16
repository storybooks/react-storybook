import chalk from 'chalk';
import shell from 'shelljs';
import { getBabelDependencies, paddedLog, copyTemplate } from '../../helpers/helpers';
import { JsPackageManager } from '../../js-package-manager';
import { NpmOptions } from '../../NpmOptions';
import { GeneratorOptions } from '../baseGenerator';

const generator = async (
  packageManager: JsPackageManager,
  npmOptions: NpmOptions,
  installServer: boolean,
  options: GeneratorOptions
): Promise<void> => {
  // set correct project name on entry files if possible
  const dirname = shell.ls('-d', 'ios/*.xcodeproj').stdout;

  // Only notify about app name if running in React Native vanilla (Expo projects do not have ios directory)
  if (dirname) {
    const projectName = dirname.slice('ios/'.length, dirname.length - '.xcodeproj'.length - 1);

    if (projectName) {
      shell.sed('-i', '%APP_NAME%', projectName, 'storybook/index.js');
    } else {
      paddedLog(
        chalk.red(
          'ERR: Could not determine project name, to fix: https://github.com/storybookjs/storybook/issues/1277'
        )
      );
    }
  }

  const packageJson = packageManager.retrievePackageJson();

  const missingReactDom =
    !packageJson.dependencies['react-dom'] && !packageJson.devDependencies['react-dom'];
  const reactVersion = packageJson.dependencies.react;

  // should resolve to latest 5.3 version, this is required until react-native storybook supports v6
  const webAddonsV5 = [
    '@storybook/addon-links@^5.3',
    '@storybook/addon-knobs@^5.3',
    '@storybook/addon-actions@^5.3',
  ];

  const nativeAddons = ['@storybook/addon-ondevice-knobs', '@storybook/addon-ondevice-actions'];

  const packagesToResolve = [
    ...nativeAddons,
    '@storybook/react-native',
    installServer && '@storybook/react-native-server',
  ].filter(Boolean);

  const resolvedPackages = await packageManager.getVersionedPackages(...packagesToResolve);

  const babelDependencies = await getBabelDependencies(packageManager, packageJson);

  const packages = [
    ...babelDependencies,
    ...resolvedPackages,
    ...webAddonsV5,
    missingReactDom && reactVersion && `react-dom@${reactVersion}`,
  ].filter(Boolean);

  packageManager.addDependencies({ ...npmOptions, packageJson }, packages);

  if (installServer) {
    packageManager.addStorybookCommandInScripts({
      port: 7007,
    });
  }

  copyTemplate(__dirname, options.storyFormat);
};

export default generator;
