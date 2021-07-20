---
title: 'Babel'
---

Storybook’s webpack config by [default](#default-configuration) sets up [Babel](https://babeljs.io/) for ES6 transpiling. Storybook works with evergreen browsers by default.

If you want to run Storybook in IE11, make sure to [disable](../essentials/introduction#disabling-addons) the docs-addon that is part of `@storybook/addon-essentials`, as this currently [causes issues in IE11](https://github.com/storybookjs/storybook/issues/8884).

Here are some key features of Storybook's Babel configurations.

### Default configuration

We have added ES2016 support with Babel for transpiling your JS code.

In addition to that, we've added a few additional features, like object spreading and async await.

Check out our [source](https://github.com/storybookjs/storybook/blob/next/lib/core-common/src/utils/babel.ts) to learn more about these plugins.

### Custom config file

If your project has a `.storybook/.babelrc` file, we'll use that instead of the default config file.

### Custom configuration

If you need to further configure/extend the babel config Storybook uses, you can use the `babel` field of [`.storybook/main.js`](./overview#configure-your-storybook-project):

```js
// .storybook/main.js

module.exports = {
  //...
  babel: async (options) => ({
    ...options,
    // any extra options you want to set
  }),
};
```
