import path from 'path';
import { TransformOptions } from '@babel/core';
import { Configuration } from 'webpack';
import semverRegex from 'semver-regex';

function isPreactX() {
  const preactPackage = require('preact/package.json');
  const version = preactPackage.version.match(semverRegex())[0];
  const major = parseFloat(version.split('.')[0]);
  return major >= 10;
}

export function babelDefault(config: TransformOptions) {
  return {
    ...config,
    plugins: [
      ...config.plugins,
      [require.resolve('@babel/plugin-transform-react-jsx'), { pragma: 'h' }, 'preset'],
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
        react: path.dirname(
          require.resolve(isPreactX() ? 'preact/compat/package.json' : 'preact-compat/package.json')
        ),
        ...(isPreactX() && {
          'react-dom/test-utils': path.dirname(require.resolve('preact/test-utils/package.json')),
        }),
        'react-dom': path.dirname(
          require.resolve(isPreactX() ? 'preact/compat/package.json' : 'preact-compat/package.json')
        ),
      },
    },
  };
}
