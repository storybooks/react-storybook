/* eslint-disable react-hooks/rules-of-hooks */
import express, { Router } from 'express';
import compression from 'compression';

import { Builder, logConfig, Options, StorybookConfig } from '@storybook/core-common';

import { getMiddleware } from './utils/middleware';
import { getServerAddresses } from './utils/server-address';
import { getServer } from './utils/server-init';
import { useStatics } from './utils/server-statics';
import { useStoriesJson } from './utils/stories-json';

import { openInBrowser } from './utils/open-in-browser';
import { getPreviewBuilder } from './utils/get-preview-builder';
import { getManagerBuilder } from './utils/get-manager-builder';

// @ts-ignore
export const router: Router = new Router();

export async function storybookDevServer(options: Options) {
  const startTime = process.hrtime();
  const app = express();
  const server = await getServer(app, options);

  app.use(compression({ level: 1 }));

  if (typeof options.extendServer === 'function') {
    options.extendServer(server);
  }

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

  // User's own static files
  await useStatics(router, options);

  const features = await options.presets.apply<StorybookConfig['features']>('features');
  if (features?.buildStoriesJson) {
    await useStoriesJson(router, options);
  }

  getMiddleware(options.configDir)(router);
  app.use(router);

  const { port, host } = options;
  const proto = options.https ? 'https' : 'http';
  const { address, networkAddress } = getServerAddresses(port, host, proto);

  await new Promise<void>((resolve, reject) => {
    // FIXME: Following line doesn't match TypeScript signature at all 🤔
    // @ts-ignore
    server.listen({ port, host }, (error: Error) => (error ? reject(error) : resolve()));
  });

  const previewBuilder: Builder<unknown, unknown> = await getPreviewBuilder(options.configDir);
  const managerBuilder: Builder<unknown, unknown> = await getManagerBuilder(options.configDir);

  if (options.debugWebpack) {
    logConfig('Preview webpack config', await previewBuilder.getConfig(options));
    logConfig('Manager webpack config', await managerBuilder.getConfig(options));
  }

  const preview = options.ignorePreview
    ? Promise.resolve()
    : previewBuilder.start({
        startTime,
        options,
        router,
        server,
      });

  const manager = managerBuilder.start({
    startTime,
    options,
    router,
    server,
  });

  const [previewResult, managerResult] = await Promise.all([
    preview,
    manager
      // TODO #13083 Restore this when compiling the preview is fast enough
      // .then((result) => {
      //   if (!options.ci && !options.smokeTest) openInBrowser(address);
      //   return result;
      // })
      .catch(previewBuilder.bail),
  ]);

  // TODO #13083 Remove this when compiling the preview is fast enough
  if (!options.ci && !options.smokeTest) openInBrowser(host ? networkAddress : address);

  return { previewResult, managerResult, address, networkAddress };
}
