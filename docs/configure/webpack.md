---
title: 'Webpack'
---

Storybook displays your components in a custom web application built using [webpack](https://webpack.js.org/). Webpack is a complex tool but our default configuration is intended to cover off the majority of use cases. There are also [addons](/addons) available that extend the configuration for other common use cases.

You can customize Storybook's webpack setup by providing a `webpackFinal` field in [`.storybook/main.js`](./overview.md#configure-your-storybook-project) file.

The value should be an async function that receives a webpack config and eventually returns a webpack config.

### Default configuration

By default, Storybook's webpack configuration will allow you to:

#### Import Images and other static files

You can import images and other local files and have them built into the Storybook:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/my-component-story-import-static-asset.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

#### Import JSON as JavaScript

You can import `.json` files and have them expanded to a JavaScript object:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/my-component-story-import-json.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

If you want to know the exact details of the webpack config, the best way is to run:

```shell
yarn storybook --debug-webpack
```

### Extending Storybook’s webpack config

To extend the above configuration, use the `webpackFinal` field of [`.storybook/main.js`](./overview.md#configure-story-rendering).

The value should export a `function`, which will receive the default config as its first argument. The second argument is an options object from Storybook, this will have information about where config came from, whether we're in production or development mode etc.

For example, here's a `.storybook/main.js` to add [Sass](https://sass-lang.com/) support:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-add-sass-config.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Storybook uses the config returned from the above function to render your components in Storybook's "preview" iframe. Note that Storybook has a completely separate webpack config for its own UI (also referred to as the "manager"), so the customizations you make only applies to the rendering of your stories, i.e. you can completely replace `config.module.rules` if you want.

Nevertheless, edit `config` with care. Make sure to preserve the following config options:

- **entry**
- **output**

Furthermore, `config` requires the `HtmlWebpackplugin` to generate the preview page, so rather than overwriting `config.plugins` you should probably append to it (or overwrite it with care), see [the following issue](https://github.com/storybookjs/storybook/issues/6020) for examples on how to handle this:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-simplified-config.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Finally, if your custom webpack config uses a loader that does not explicitly include specific file extensions via the `test` property, it is necessary to `exclude` the `.ejs` file extension from that loader.

If you're using a non-standard Storybook config directory, you should put `main.js` there instead of `.storybook` and update the `include` path to make sure that it resolves to your project root.

### Using your existing config

If you have an existing webpack config for your project and want to reuse this app's configuration, you can import your main webpack config into Storybook's [`.storybook/main.js`](./overview.md#configure-story-rendering) and merge both:

NB! If you are using Vue CLI you need to use the resolved webpack config file, which is found at `<projectRoot>/node_modules/@vue/cli-service/webpack.config.js`.

The following code snippet shows how you can replace the loaders from Storybook with the ones from your app's `webpack.config.js`:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-using-existing-config.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->
