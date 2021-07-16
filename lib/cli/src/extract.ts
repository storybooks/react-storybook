/* eslint-disable react-hooks/rules-of-hooks */
import path from 'path';
import { writeFile } from 'fs-extra';
import puppeteerCore from 'puppeteer-core';
import express from 'express';
import getPort from 'get-port';
import { logger } from '@storybook/node-logger';

const read = async (url: string) => {
  const browser = await usePuppeteerBrowser();
  const page = await browser.newPage();

  await page.goto(url);

  await page.waitForFunction(
    'window.__STORYBOOK_STORY_STORE__ && window.__STORYBOOK_STORY_STORE__.extract && window.__STORYBOOK_STORY_STORE__.extract()'
  );
  const data = JSON.parse(
    await page.evaluate(async () =>
      JSON.stringify(window.__STORYBOOK_STORY_STORE__.getStoriesJsonData(), null, 2)
    )
  );

  setImmediate(() => {
    browser.close();
  });
  return data;
};

const useLocation: (input: string) => Promise<[string, () => void]> = async (input: string) => {
  if (input.match(/^http/)) {
    return [input, async () => {}];
  }

  const app = express();

  app.use(express.static(input));

  const port = await getPort();

  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      const result = `http://localhost:${port}/iframe.html`;

      logger.info(`connecting to: ${result}`);

      resolve([result, server.close.bind(server)]);
    });
  });
};

const usePuppeteerBrowser: () => Promise<puppeteerCore.Browser> = async () => {
  const args = ['--no-sandbox ', '--disable-setuid-sandbox'];
  try {
    return await puppeteerCore.launch({ args });
  } catch (e) {
    // it's not installed
    logger.info('installing puppeteer...');
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line global-require
      require('child_process').exec(
        `node ${require.resolve(path.join('puppeteer-core', 'install.js'))}`,
        (error: any) => (error ? reject(error) : resolve(puppeteerCore.launch({ args })))
      );
    });
  }
};

export async function extract(input: string, targetPath: string) {
  if (input && targetPath) {
    const [location, exit] = await useLocation(input);

    const data = await read(location);

    await writeFile(targetPath, JSON.stringify(data, null, 2));

    await exit();
  } else {
    throw new Error(
      'Extract: please specify a path where your built-storybook is (can be a public url) and a target directory'
    );
  }
}
