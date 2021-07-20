---
title: 'Next/Vercel'
---

### Setup webpack

Next is providing an addon for Storybook under the [@next/plugin-storybook](https://www.npmjs.com/package/@next/plugin-storybook) package.

See [the official Storybook example in Next](https://github.com/vercel/next.js/tree/canary/examples/with-storybook) for usage.

This plugin will automatically extend Storybook build step to behave similarly to Next. You will enjoy features such as [module path aliases](https://nextjs.org/docs/advanced-features/module-path-aliases) being computed directly based on your `tsconfig.json` or `jsconfig.json` `paths` configuration.

### Serve static build with `serve`

[`serve`](https://github.com/vercel/serve) is a micro-server for static websites. You can use it to serve the built version of your Storybook stories.

```sh
yarn build-storybook -s ./public
yarn add -D serve
yarn serve storybook-static
```
