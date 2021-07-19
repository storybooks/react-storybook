import path from 'path';
import fse from 'fs-extra';
import { DefinePlugin, Configuration, WebpackPluginInstance } from 'webpack';
import Dotenv from 'dotenv-webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';
import VirtualModulePlugin from 'webpack-virtual-modules';
import TerserWebpackPlugin from 'terser-webpack-plugin';

import themingPaths from '@storybook/theming/paths';
import uiPaths from '@storybook/ui/paths';

import readPackage from 'read-pkg-up';
import {
  resolvePathInStorybookCache,
  stringifyEnvs,
  es6Transpiler,
  getManagerHeadTemplate,
  getManagerMainTemplate,
  Options,
  ManagerWebpackOptions,
  hasDotenv,
} from '@storybook/core-common';

import { babelLoader } from './babel-loader-manager';

export default async ({
  configDir,
  configType,
  docsMode,
  entries,
  refs,
  outputDir,
  previewUrl,
  versionCheck,
  releaseNotesData,
  presets,
  modern,
}: Options & ManagerWebpackOptions): Promise<Configuration> => {
  const envs = await presets.apply<Record<string, string>>('env');
  const logLevel = await presets.apply('logLevel', undefined);
  const template = await presets.apply('managerMainTemplate', getManagerMainTemplate());

  const headHtmlSnippet = await presets.apply(
    'managerHead',
    getManagerHeadTemplate(configDir, process.env)
  );
  const isProd = configType === 'PRODUCTION';
  const refsTemplate = fse.readFileSync(path.join(__dirname, 'virtualModuleRef.template.js'), {
    encoding: 'utf8',
  });
  const {
    packageJson: { version },
  } = await readPackage({ cwd: __dirname });

  // @ts-ignore
  // const { BundleAnalyzerPlugin } = await import('webpack-bundle-analyzer').catch(() => ({}));

  return {
    name: 'manager',
    mode: isProd ? 'production' : 'development',
    bail: isProd,
    devtool: false,
    entry: entries,
    output: {
      path: outputDir,
      filename: isProd ? '[name].[contenthash].manager.bundle.js' : '[name].manager.bundle.js',
      publicPath: '',
    },
    watchOptions: {
      ignored: /node_modules/,
    },
    plugins: [
      refs
        ? ((new VirtualModulePlugin({
            [path.resolve(path.join(configDir, `generated-refs.js`))]: refsTemplate.replace(
              `'{{refs}}'`,
              JSON.stringify(refs)
            ),
          }) as any) as WebpackPluginInstance)
        : null,
      (new HtmlWebpackPlugin({
        filename: `index.html`,
        // FIXME: `none` isn't a known option
        chunksSortMode: 'none' as any,
        alwaysWriteToDisk: true,
        inject: false,
        templateParameters: (compilation, files, options) => ({
          compilation,
          files,
          options,
          version,
          globals: {
            CONFIG_TYPE: configType,
            LOGLEVEL: logLevel,
            VERSIONCHECK: JSON.stringify(versionCheck),
            RELEASE_NOTES_DATA: JSON.stringify(releaseNotesData),
            DOCS_MODE: docsMode, // global docs mode
            PREVIEW_URL: previewUrl, // global preview URL
          },
          headHtmlSnippet,
          lang: envs.STORYBOOK_PREVIEW_HTML_LANG || 'en',
        }),
        template,
      }) as any) as WebpackPluginInstance,
      (new CaseSensitivePathsPlugin() as any) as WebpackPluginInstance,
      hasDotenv() ? new Dotenv({ silent: true }) : null,
      // graphql sources check process variable
      new DefinePlugin({
        'process.env': stringifyEnvs(envs),
        NODE_ENV: JSON.stringify(envs.NODE_ENV),
      }) as WebpackPluginInstance,
      // isProd &&
      //   BundleAnalyzerPlugin &&
      //   new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false }),
    ].filter(Boolean),
    module: {
      rules: [
        babelLoader(),
        es6Transpiler() as any,
        {
          test: /\.css$/,
          use: [
            require.resolve('style-loader'),
            {
              loader: require.resolve('css-loader'),
              options: {
                importLoaders: 1,
              },
            },
          ],
        },
        {
          test: /\.(svg|ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
          loader: require.resolve('file-loader'),
          options: {
            name: isProd
              ? 'static/media/[name].[contenthash:8].[ext]'
              : 'static/media/[path][name].[ext]',
          },
        },
        {
          test: /\.(mp4|webm|wav|mp3|m4a|aac|oga)(\?.*)?$/,
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: isProd
              ? 'static/media/[name].[contenthash:8].[ext]'
              : 'static/media/[path][name].[ext]',
          },
        },
      ],
    },
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.json', '.cjs', '.ts', '.tsx'],
      modules: ['node_modules'].concat(envs.NODE_PATH || []),
      mainFields: [modern ? 'sbmodern' : null, 'browser', 'module', 'main'].filter(Boolean),
      alias: {
        ...themingPaths,
        ...uiPaths,
      },
    },
    recordsPath: resolvePathInStorybookCache('public/records.json'),
    performance: {
      hints: false,
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: true,
      sideEffects: true,
      usedExports: true,
      concatenateModules: true,
      minimizer: isProd
        ? [
            new TerserWebpackPlugin({
              parallel: true,
              terserOptions: {
                mangle: false,
                sourceMap: true,
                keep_fnames: true,
              },
            }),
          ]
        : [],
    },
  };
};
