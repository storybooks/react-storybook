/* eslint-disable react-hooks/rules-of-hooks */
import webpack, { Stats, Configuration, ProgressPlugin } from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { logger } from '@storybook/node-logger';
import {
  Builder,
  useProgressReporting,
  checkWebpackVersion,
  Options,
  normalizeStories,
  StoriesEntry,
} from '@storybook/core-common';

let compilation: ReturnType<typeof webpackDevMiddleware>;
let reject: (reason?: any) => void;

type WebpackBuilder = Builder<Configuration, Stats>;

export const getConfig: WebpackBuilder['getConfig'] = async (options) => {
  const { presets } = options;
  const typescriptOptions = await presets.apply('typescript', {}, options);
  const babelOptions = await presets.apply('babel', {}, { ...options, typescriptOptions });
  const entries = await presets.apply('entries', [], options);
  const stories = normalizeStories(
    (await presets.apply('stories', [], options)) as StoriesEntry[],
    {
      configDir: options.configDir,
      workingDir: process.cwd(),
    }
  );
  const frameworkOptions = await presets.apply(`${options.framework}Options`, {}, options);

  return presets.apply(
    'webpack',
    {},
    {
      ...options,
      babelOptions,
      entries,
      stories,
      typescriptOptions,
      [`${options.framework}Options`]: frameworkOptions,
    }
  ) as any;
};

export const executor = {
  get: async (options: Options) => {
    const version = ((await options.presets.apply('webpackVersion')) || '5') as string;
    const webpackInstance =
      (await options.presets.apply<{ default: typeof webpack }>('webpackInstance'))?.default ||
      webpack;
    checkWebpackVersion({ version }, '5', 'builder-webpack5');
    return webpackInstance;
  },
};

export const start: WebpackBuilder['start'] = async ({ startTime, options, router }) => {
  const webpackInstance = await executor.get(options);

  const config = await getConfig(options);
  const compiler = webpackInstance(config);
  if (!compiler) {
    const err = `${config.name}: missing webpack compiler at runtime!`;
    logger.error(err);
    return {
      bail,
      totalTime: process.hrtime(startTime),
      stats: ({
        hasErrors: () => true,
        hasWarnings: () => false,
        toJson: () => ({ warnings: [] as any[], errors: [err] }),
      } as any) as Stats,
    };
  }

  const { handler, modulesCount } = await useProgressReporting(router, startTime, options);
  new ProgressPlugin({ handler, modulesCount }).apply(compiler);

  const middlewareOptions: Parameters<typeof webpackDevMiddleware>[1] = {
    publicPath: config.output?.publicPath as string,
    writeToDisk: true,
  };

  compilation = webpackDevMiddleware(compiler, middlewareOptions);

  router.use(compilation);
  router.use(webpackHotMiddleware(compiler as any));

  const stats = await new Promise<Stats>((ready, stop) => {
    compilation.waitUntilValid(ready);
    reject = stop;
  });

  if (!stats) {
    throw new Error('no stats after building preview');
  }

  if (stats.hasErrors()) {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw stats;
  }

  return {
    bail,
    stats,
    totalTime: process.hrtime(startTime),
  };
};

export const bail: WebpackBuilder['bail'] = (e: Error) => {
  if (reject) {
    reject();
  }
  if (process) {
    try {
      compilation.close();
      logger.warn('Force closed preview build');
    } catch (err) {
      logger.warn('Unable to close preview build!');
    }
  }
  throw e;
};

export const build: WebpackBuilder['build'] = async ({ options, startTime }) => {
  const webpackInstance = await executor.get(options);

  logger.info('=> Compiling preview..');
  const config = await getConfig(options);

  return new Promise((succeed, fail) => {
    const compiler = webpackInstance(config);

    compiler.run((error, stats) => {
      if (error || !stats || stats.hasErrors()) {
        logger.error('=> Failed to build the preview');
        process.exitCode = 1;

        if (error) {
          logger.error(error.message);

          compiler.close(() => fail(error));

          return;
        }

        if (stats && (stats.hasErrors() || stats.hasWarnings())) {
          const { warnings = [], errors = [] } = stats.toJson({ warnings: true, errors: true });

          errors.forEach((e) => logger.error(e.message));
          warnings.forEach((e) => logger.error(e.message));

          compiler.close(() => fail(stats));

          return;
        }
      }

      logger.trace({ message: '=> Preview built', time: process.hrtime(startTime) });
      if (stats && stats.hasWarnings()) {
        stats.toJson({ warnings: true }).warnings.forEach((e) => logger.warn(e.message));
      }

      // https://webpack.js.org/api/node/#run
      // #15227
      compiler.close((closeErr) => {
        if (closeErr) {
          return fail(closeErr);
        }

        return succeed(stats);
      });
    });
  });
};

export const corePresets = [require.resolve('./presets/preview-preset.js')];
export const overridePresets = [require.resolve('./presets/custom-webpack-preset.js')];
