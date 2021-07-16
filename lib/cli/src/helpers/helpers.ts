/* eslint-disable no-param-reassign */
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import chalk from 'chalk';
import { satisfies } from '@storybook/semver';
import stripJsonComments from 'strip-json-comments';

import { StoryFormat, SupportedFrameworks, SupportedLanguage } from '../project_types';
import {
  JsPackageManager,
  PackageJson,
  PackageJsonWithDepsAndDevDeps,
} from '../js-package-manager';

const logger = console;

export function getBowerJson() {
  const bowerJsonPath = path.resolve('bower.json');
  if (!fs.existsSync(bowerJsonPath)) {
    return false;
  }

  const jsonContent = fs.readFileSync(bowerJsonPath, 'utf8');
  return JSON.parse(jsonContent);
}

export function readFileAsJson(jsonPath: string, allowComments?: boolean) {
  const filePath = path.resolve(jsonPath);
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const jsonContent = allowComments ? stripJsonComments(fileContent) : fileContent;

  try {
    return JSON.parse(jsonContent);
  } catch (e) {
    logger.error(chalk.red(`Invalid json in file: ${filePath}`));
    throw e;
  }
}

export const writeFileAsJson = (jsonPath: string, content: unknown) => {
  const filePath = path.resolve(jsonPath);
  if (!fs.existsSync(filePath)) {
    return false;
  }

  fs.writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`);
  return true;
};

export function paddedLog(message: string) {
  const newMessage = message
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n');

  logger.log(newMessage);
}

export function getChars(char: string, amount: number) {
  let line = '';
  for (let lc = 0; lc < amount; lc += 1) {
    line += char;
  }

  return line;
}

export function codeLog(codeLines: string[], leftPadAmount?: number) {
  let maxLength = 0;
  const newLines = codeLines.map((line) => {
    maxLength = line.length > maxLength ? line.length : maxLength;
    return line;
  });

  const finalResult = newLines
    .map((line) => {
      const rightPadAmount = maxLength - line.length;
      let newLine = line + getChars(' ', rightPadAmount);
      newLine = getChars(' ', leftPadAmount || 2) + chalk.inverse(` ${newLine} `);
      return newLine;
    })
    .join('\n');

  logger.log(finalResult);
}

/**
 * Detect if any babel dependencies need to be added to the project
 * @param {Object} packageJson The current package.json so we can inspect its contents
 * @returns {Array} Contains the packages and versions that need to be installed
 * @example
 * const babelDependencies = await getBabelDependencies(packageManager, npmOptions, packageJson);
 * // you can then spread the result when using installDependencies
 * installDependencies(npmOptions, [
 *   `@storybook/react@${storybookVersion}`,
 *   ...babelDependencies,
 * ]);
 */
export async function getBabelDependencies(
  packageManager: JsPackageManager,
  packageJson: PackageJsonWithDepsAndDevDeps
) {
  const dependenciesToAdd = [];
  let babelLoaderVersion = '^8.0.0-0';

  const babelCoreVersion =
    packageJson.dependencies['babel-core'] || packageJson.devDependencies['babel-core'];

  if (!babelCoreVersion) {
    if (!packageJson.dependencies['@babel/core'] && !packageJson.devDependencies['@babel/core']) {
      const babelCoreInstallVersion = await packageManager.getVersion('@babel/core');
      dependenciesToAdd.push(`@babel/core@${babelCoreInstallVersion}`);
    }
  } else {
    const latestCompatibleBabelVersion = await packageManager.latestVersion(
      'babel-core',
      babelCoreVersion
    );
    // Babel 6
    if (satisfies(latestCompatibleBabelVersion, '^6.0.0')) {
      babelLoaderVersion = '^7.0.0';
    }
  }

  if (!packageJson.dependencies['babel-loader'] && !packageJson.devDependencies['babel-loader']) {
    const babelLoaderInstallVersion = await packageManager.getVersion(
      'babel-loader',
      babelLoaderVersion
    );
    dependenciesToAdd.push(`babel-loader@${babelLoaderInstallVersion}`);
  }

  return dependenciesToAdd;
}

export function addToDevDependenciesIfNotPresent(
  packageJson: PackageJson,
  name: string,
  packageVersion: string
) {
  if (!packageJson.dependencies[name] && !packageJson.devDependencies[name]) {
    packageJson.devDependencies[name] = packageVersion;
  }
}

export function copyTemplate(templateRoot: string, storyFormat: StoryFormat) {
  const templateDir = path.resolve(templateRoot, `template-${storyFormat}/`);

  if (!fs.existsSync(templateDir)) {
    // Fallback to CSF plain first, in case format is typescript but template is not available.
    if (storyFormat === StoryFormat.CSF_TYPESCRIPT) {
      copyTemplate(templateRoot, StoryFormat.CSF);
      return;
    }

    throw new Error(`Unsupported story format: ${storyFormat}`);
  }

  fse.copySync(templateDir, '.', { overwrite: true });
}

export function copyComponents(framework: SupportedFrameworks, language: SupportedLanguage) {
  const languageFolderMapping: Record<SupportedLanguage, string> = {
    javascript: 'js',
    typescript: 'ts',
  };
  const componentsPath = () => {
    const frameworkPath = `frameworks/${framework}`;
    const languageSpecific = path.resolve(
      __dirname,
      `${frameworkPath}/${languageFolderMapping[language]}`
    );
    if (fse.existsSync(languageSpecific)) {
      return languageSpecific;
    }
    const jsFallback = path.resolve(
      __dirname,
      `${frameworkPath}/${languageFolderMapping.javascript}`
    );
    if (fse.existsSync(jsFallback)) {
      return jsFallback;
    }
    const frameworkRootPath = path.resolve(__dirname, frameworkPath);
    if (fse.existsSync(frameworkRootPath)) {
      return frameworkRootPath;
    }
    throw new Error(`Unsupported framework: ${framework}`);
  };

  const targetPath = () => {
    if (fse.existsSync('./src')) {
      return './src/stories';
    }
    return './stories';
  };

  const destinationPath = targetPath();
  fse.copySync(componentsPath(), destinationPath, { overwrite: true });
  fse.copySync(path.resolve(__dirname, 'frameworks/common'), destinationPath, { overwrite: true });
}
