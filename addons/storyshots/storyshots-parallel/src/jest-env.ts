import puppeteer, { Browser } from 'puppeteer';
import NodeEnvironment from 'jest-environment-node';

const getStorybookData = async (browser: Browser, url: string) => {
  const page = await browser.newPage();

  await page.goto(`${url}/iframe.html`);
  await page.waitForFunction(
    'window.__STORYBOOK_STORY_STORE__ && window.__STORYBOOK_STORY_STORE__.extract && window.__STORYBOOK_STORY_STORE__.extract()'
  );

  return JSON.parse(
    await page.evaluate(async () => {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      return JSON.stringify(window.__STORYBOOK_STORY_STORE__.getStoriesJsonData(), null, 2);
    })
  );
};

class CustomEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    const browser = await puppeteer.launch();
    const storybookData = await getStorybookData(browser, process.env.STORYBOOK_URL);
    this.global.stories = Object.values(storybookData.stories).map((story: any) => ({
      ...story,
      url: `${process.env.STORYBOOK_URL}/iframe.html?id=${story.id}`,
    }));

    this.global.browser = browser;
  }

  async teardown() {
    await this.global.browser.close();
    await super.teardown();
  }
}

module.exports = CustomEnvironment;
