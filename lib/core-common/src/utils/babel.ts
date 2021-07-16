import { TransformOptions } from '@babel/core';

const plugins = [
  require.resolve('@babel/plugin-transform-shorthand-properties'),
  require.resolve('@babel/plugin-transform-block-scoping'),
  /*
   * Added for TypeScript experimental decorator support
   * https://babeljs.io/docs/en/babel-plugin-transform-typescript#typescript-compiler-options
   */
  [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
  [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
  [require.resolve('@babel/plugin-proposal-private-methods'), { loose: true }],
  require.resolve('@babel/plugin-proposal-export-default-from'),
  require.resolve('@babel/plugin-syntax-dynamic-import'),
  [
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
    { loose: true, useBuiltIns: true },
  ],
  require.resolve('@babel/plugin-transform-classes'),
  require.resolve('@babel/plugin-transform-arrow-functions'),
  require.resolve('@babel/plugin-transform-parameters'),
  require.resolve('@babel/plugin-transform-destructuring'),
  require.resolve('@babel/plugin-transform-spread'),
  require.resolve('@babel/plugin-transform-for-of'),
  require.resolve('babel-plugin-macros'),
  /*
   * Optional chaining and nullish coalescing are supported in
   * @babel/preset-env, but not yet supported in Webpack due to support
   * missing from acorn. These can be removed once Webpack has support.
   * See https://github.com/facebook/create-react-app/issues/8445#issuecomment-588512250
   */
  require.resolve('@babel/plugin-proposal-optional-chaining'),
  require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
  [
    require.resolve('babel-plugin-polyfill-corejs3'),
    {
      method: 'usage-global',
      absoluteImports: require.resolve('core-js'),
      // eslint-disable-next-line global-require
      version: require('core-js/package.json').version,
    },
  ],
];

const presets = [
  [require.resolve('@babel/preset-env'), { shippedProposals: true, loose: true }],
  require.resolve('@babel/preset-typescript'),
];

export const babelConfig: () => TransformOptions = () => ({
  sourceType: 'unambiguous',
  presets: [...presets],
  plugins: [...plugins],
});
