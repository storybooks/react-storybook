const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { screenshotUrls } = require('../dist/screenshot');

expect.extend({ toMatchImageSnapshot });

describe('Storyshots', () => {
  let storyshots;
  const { stories, browser } = global;

  beforeAll(async () => {
    storyshots = await screenshotUrls(
      browser,
      stories.map((s) => s.url),
      { concurrency: Number(process.env.CONCURRENCY) }
    );
  }, 120000);

  stories.forEach((story) => {
    test(`Snapshot ${story.name}`, () => {
      const { image } = storyshots.find(({ url }) => url === story.url);
      expect(image).toMatchImageSnapshot();
    });
  });
});
