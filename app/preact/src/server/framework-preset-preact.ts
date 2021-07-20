import path from 'path';
import { TransformOptions } from '@babel/core';
import { Configuration } from 'webpack';

export function babelDefault(config: TransformOptions) {
  return {
    ...config,
    plugins: [
      [
        require.resolve('@babel/plugin-transform-react-jsx'),
        { importSource: 'preact', runtime: 'automatic' },
      ],
      ...config.plugins,
    ],
  };
}

export function webpackFinal(config: Configuration) {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        react: path.dirname(require.resolve('preact/compat/package.json')),
        'react-dom/test-utils': path.dirname(require.resolve('preact/test-utils/package.json')),
        'react-dom': path.dirname(require.resolve('preact/compat/package.json')),
      },
    },
  };
}
