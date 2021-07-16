import { writeFileAsJson, readFileAsJson, copyTemplate } from '../../helpers/helpers';
import { baseGenerator, Generator } from '../baseGenerator';

function addStorybookExcludeGlobToTsConfig() {
  const tsConfigJson = readFileAsJson('tsconfig.json', true);
  const glob = '**/*.stories.ts';
  if (!tsConfigJson) {
    return;
  }

  const { exclude = [] } = tsConfigJson;
  if (exclude.includes(glob)) {
    return;
  }

  tsConfigJson.exclude = [...exclude, glob];
  writeFileAsJson('tsconfig.json', tsConfigJson);
}

const generator: Generator = async (packageManager, npmOptions, options) => {
  addStorybookExcludeGlobToTsConfig();
  baseGenerator(packageManager, npmOptions, options, 'aurelia', {
    extraPackages: ['aurelia'],
  });
  copyTemplate(__dirname, options.storyFormat);
};

export default generator;
