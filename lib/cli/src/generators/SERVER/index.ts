import { baseGenerator, Generator } from '../baseGenerator';
import { copyTemplate } from '../../helpers/helpers';

const generator: Generator = async (packageManager, npmOptions, options) => {
  baseGenerator(packageManager, npmOptions, options, 'server', {
    extensions: ['json'],
  });

  copyTemplate(__dirname, options.storyFormat);
};

export default generator;
