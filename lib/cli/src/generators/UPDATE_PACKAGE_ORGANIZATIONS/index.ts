/* eslint-disable no-param-reassign */
import path from 'path';
import { sync as spawnSync } from 'cross-spawn';
import { packageNames } from '@storybook/codemod';
import { getBabelDependencies } from '../../helpers/helpers';
import { NpmOptions } from '../../NpmOptions';
import { JsPackageManager, PackageJson, writePackageJson } from '../../js-package-manager';

async function updatePackage(
  packageManager: JsPackageManager,
  devDependencies: PackageJson['devDependencies'],
  oldName: string,
  newName: string
) {
  if (devDependencies[oldName]) {
    delete devDependencies[oldName];
    devDependencies[newName] = await packageManager.getVersion(newName);
  }
}

async function updatePackageJson(packageManager: JsPackageManager, npmOptions: NpmOptions) {
  const packageJson = packageManager.retrievePackageJson();
  const { devDependencies } = packageJson;

  const [actionsVersion, linksVersion] = await packageManager.getVersions(
    '@storybook/addon-actions',
    '@storybook/addon-links'
  );

  devDependencies['@storybook/addon-actions'] = actionsVersion;
  devDependencies['@storybook/addon-links'] = linksVersion;

  await Promise.all(
    Object.keys(packageNames).map((oldName) => {
      const newName = packageNames[oldName];
      return updatePackage(packageManager, devDependencies, oldName, newName);
    })
  );

  if (!devDependencies['@storybook/react'] && !devDependencies['@storybook/react-native']) {
    throw new Error('Expected to find `@kadira/[react-native]-storybook` in devDependencies');
  }

  writePackageJson(packageJson);

  const babelDependencies = await getBabelDependencies(packageManager, packageJson);

  if (babelDependencies.length > 0) {
    packageManager.addDependencies({ ...npmOptions, packageJson }, babelDependencies);
  }
}

function updateSourceCode(parser: string) {
  const jscodeshiftPath = path.dirname(require.resolve('jscodeshift'));
  const jscodeshiftCommand = path.join(jscodeshiftPath, 'bin', 'jscodeshift.sh');

  ['update-organisation-name.js', 'move-builtin-addons.js'].forEach((codemod) => {
    const codemodPath = path.join(
      path.dirname(require.resolve('@storybook/codemod')),
      'transforms',
      codemod
    );

    const args = ['-t', codemodPath, '--silent', '--ignore-pattern', '"node_modules|dist"', '.'];
    if (parser) args.push('--parser', parser);

    spawnSync(jscodeshiftCommand, args, { stdio: 'inherit' });
  });
}

export default async (packageManager: JsPackageManager, parser: string, npmOptions: NpmOptions) => {
  await updatePackageJson(packageManager, npmOptions);
  updateSourceCode(parser);
};
