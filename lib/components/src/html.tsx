import dedent from 'ts-dedent';
import deprecate from 'util-deprecate';

const deprecatedHtmlEndpoint = deprecate(
  () => {},
  dedent`
    The entry point '@storybook/components/html' is deprecated. Please use '@storybook/components' directly instead.

    See https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#deprecated-storybook-components-html-entry-point
  `
);
deprecatedHtmlEndpoint();

// TODO: THIS IS ACTUALLY A REALLY BIG PROBLEM: MULTIPLE EXPORTS OF THE SAME NAME: 'components'
// eslint-disable-next-line import/export
export * from './typography/DocumentFormatting';
// eslint-disable-next-line import/export
export { components, resetComponents } from './index';
