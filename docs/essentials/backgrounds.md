---
title: 'Backgrounds'
---

The backgrounds toolbar item allows you to adjust the background that your story is rendered on via Storybook’s UI:

<video autoPlay muted playsInline loop>
  <source
    src="addon-backgrounds-optimized.mp4"
    type="video/mp4"
  />
</video>

## Configuration

By default, the backgrounds toolbar presents you with a light and dark background.

But you're not restricted to these two backgrounds, you can configure your own set of colors with the `parameters.backgrounds` [parameter](../writing-stories/parameters.md) in your [`.storybook/preview.js`](../configure/overview.md#configure-story-rendering):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-preview-configure-background-colors.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

If you define the `default` property, the backgrounds toolbar will set that color for every story where the parameter is applied to. If you don't set it, the colors will be available but not automatically set when a story is rendered.

You can also set backgrounds on per-story or per-component basis by using [parameter inheritance](../writing-stories/parameters.md#component-parameters):

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addon-backgrounds-configure-backgrounds.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

You can also only override a single key on the backgrounds parameter, for instance to set a different default value for a single story:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addon-backgrounds-override-background-color.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

If you want to disable backgrounds in a story, you can do so by setting the `backgrounds` parameter like so:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addon-backgrounds-disable-backgrounds.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

### CSS Variables

The second use case of this addon is to apply a set of [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) to enable theming of components.
There are two ways to provide CSS variables to the components in the preview. 

#### Inline 

The easy way is to provide the CSS variables via configuration.

<!-- prettier-ignore-start -->

<CodeSnippets
paths={[
'common/storybook-preview-configure-background-colors-with-variables.js.mdx',
]}
/>

<!-- prettier-ignore-end -->

#### External CSS file

Another way is the use of an external CSS file to provide CSS variables. This reduces redundancies and enables the use of the CSS variables in the application and the Storybook. The CSS file should be accessible via HTTP.

<!-- prettier-ignore-start -->

<CodeSnippets
paths={[
'common/storybook-preview-configure-background-colors-with-variables-external.js.mdx',
]}
/>

<CodeSnippets
paths={[
'common/storybook-preview-configure-background-colors-with-variables-external-css.js.mdx',
]}
/>

<!-- prettier-ignore-end -->


## Grid

Backgrounds toolbar also comes with a Grid selector. This way you can easily see if your components are aligned.

By default you don't need to configure anything in order to use it, but the properties of the grid are fully configurable. 

Each of these properties have the following default values in case they are not passed:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addon-backgrounds-configure-grid.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

If you wish to disable the grid in a story, you can do so by setting the `backgrounds` parameter like so:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-addon-backgrounds-disable-grid.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->
