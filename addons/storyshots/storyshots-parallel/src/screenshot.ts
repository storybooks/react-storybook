import pAll from 'p-all';
import { Browser } from 'puppeteer';

export const renderScreenshot = async (browser: Browser, url: string) => {
  const page = await browser.newPage();
  page.on('dialog', async (dialog) => {
    await dialog.dismiss();
  });
  await page.goto(url, { waitUntil: 'networkidle0' });
  const image = await page.screenshot({ fullPage: true });
  await page.close();
  return image;
};

export const screenshotUrls = async (
  browser: Browser,
  urls: string[],
  { concurrency = 5 }: { concurrency?: number }
) => {
  const tasks = urls.map((url, index) => async () => {
    console.log(`Rendering screenshot ${index}/${urls.length}: ${url}`);
    const image = await renderScreenshot(browser, url);
    return { url, image };
  });

  return pAll(tasks, { concurrency });
};
