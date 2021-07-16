import deprecate from 'util-deprecate';
import dedent from 'ts-dedent';

import { DecoratorFunction } from '../models';

export const decorateAction = (_decorators: DecoratorFunction[]) =>
  deprecate(
    () => {},
    dedent`
    decorateAction is no longer supported as of Storybook 6.0.
  `
  );

const deprecatedCallback = deprecate(() => {},
'decorate.* is no longer supported as of Storybook 6.0.');

export const decorate = (_decorators: DecoratorFunction[]) =>
  deprecate(
    () => ({
      action: deprecatedCallback,
      actions: deprecatedCallback,
      withActions: deprecatedCallback,
    }),
    dedent`
    decorate is deprecated, please configure addon-actions using the addParameter api:
      
      addParameters({
        actions: {
          handles: options
        },
      });
    `
  );
