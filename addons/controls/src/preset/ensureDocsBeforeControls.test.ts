import { verifyDocsBeforeControls } from './ensureDocsBeforeControls';

describe.each([
  [[]],
  [['@storybook/addon-controls']],
  [['@storybook/addon-docs']],
  [['@storybook/addon-controls', '@storybook/addon-docs']],
  [['@storybook/addon-essentials', '@storybook/addon-docs']],
  [['@storybook/addon-controls', '@storybook/addon-essentials']],
  [['@storybook/addon-essentials', '@storybook/addon-controls', '@storybook/addon-docs']],
])('verifyDocsBeforeControls', (input) => {
  it(`invalid ${input}`, () => {
    expect(verifyDocsBeforeControls(input)).toBeFalsy();
  });
});

describe.each([
  [['@storybook/addon-docs', '@storybook/addon-controls']],
  [['@storybook/addon-docs', 'foo/node_modules/@storybook/addon-controls']],
  [[{ name: '@storybook/addon-docs' }, '@storybook/addon-controls']],
  [['@storybook/addon-essentials', '@storybook/addon-controls']],
  [['@storybook/addon-essentials']],
])('verifyDocsBeforeControls-truthy', (input) => {
  it(`valid ${input}`, () => {
    expect(verifyDocsBeforeControls(input)).toBeTruthy();
  });
});
