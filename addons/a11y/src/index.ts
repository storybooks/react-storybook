import { DecoratorFunction } from '@storybook/addons';
import deprecate from 'util-deprecate';
import dedent from 'ts-dedent';

export { PARAM_KEY } from './constants';
export * from './highlight';

if (module && module.hot && module.hot.decline) {
  module.hot.decline();
}

export const withA11y: DecoratorFunction = deprecate(
  (storyFn, storyContext) => storyFn(storyContext),
  dedent`
    withA11y(options) is deprecated, please configure addon-a11y using the addParameter api:

    addParameters({
      a11y: options,
    });

    More at: https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#removed-witha11y-decorator
  `
);
