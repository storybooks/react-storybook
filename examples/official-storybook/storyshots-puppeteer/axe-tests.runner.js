/* This file is not suffixed by ".test.js" to not being run with all other test files.
 * This test needs the static build of the storybook to run.
 * `yarn run storyshots-puppeteer` generates the static build & uses storyshots-puppeteer.
 * */
import path from 'path';
import initStoryshots from '@storybook/addon-storyshots';
import { axeTest } from '@storybook/addon-storyshots-puppeteer';
import getStorybookUrl from './getStorybookUrl';

const storybookUrl = getStorybookUrl();
if (storybookUrl != null) {
  initStoryshots({
    suite: 'Puppeteer tests',
    storyFilterFunction: (story) => story.kind.startsWith('Basics') || story.kind.startsWith('UI'),
    framework: 'react',
    configPath: path.join(__dirname, '..'),
    test: axeTest({ storybookUrl }),
  });
}
