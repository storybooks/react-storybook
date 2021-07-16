/* eslint-disable react-hooks/rules-of-hooks */
import { getProjectRoot } from '@storybook/core-common';
import { useBaseTsSupport } from './useBaseTsSupport';

export const createBabelLoader = (options: any, framework: string) => ({
  test: useBaseTsSupport(framework) ? /\.(mjs|tsx?|jsx?)$/ : /\.(mjs|jsx?)$/,
  use: [
    {
      loader: require.resolve('babel-loader'),
      options,
    },
  ],
  include: [getProjectRoot()],
  exclude: /node_modules/,
});
