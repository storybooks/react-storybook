---
title: 'TypeScript'
---

Storybook has built-in Typescript support, so your Typescript project should work with zero configuration needed. The config files from `.storybook` can be in TypeScript as well.

### Default configuration

The base Typescript configuration uses [`babel-loader`](https://webpack.js.org/loaders/babel-loader/) for Typescript transpilation, and optionally <a href="https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/blob/v4.1.6/README.md#options"><code>fork-ts-checker-webpack-plugin</code></a> for checking.

Each framework uses the base configuration unless otherwise specified:

- Angular ignores the base and uses `ts-loader` and `ngx-template-loader`.
- Vue ignores the base and uses `ts-loader` and applies it to both `.tsx` and `.vue` files.
- React adds `react-docgen-typescript-plugin` to the base.

### Main.js configuration

To make it easier to configure Typescript handling, use the `typescript` field in your [`.storybook/main.js`](./overview.md#configure-story-rendering).

The following code snippets shows the fields for you to use with TypeScript:

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-add-ts-config.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

| Field                            | Framework | Description                                                                                 | Type                                                                                                   |
| :------------------------------- | :-------- | :------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------- |
| **check**                        | All       | Optionally run fork-ts-checker-webpack-plugin                                               | boolean                                                                                                |
| **checkOptions**                 | All       | Options to pass to fork-ts-checker-webpack-plugin if it's enabled                           | <a href="https://github.com/TypeStrong/fork-ts-checker-webpack-plugin/blob/v4.1.6/README.md#options">See Docs</a> |
| **reactDocgen**                  | React     | Which react docgen processor to run: `"react-docgen-typescript"`, `"react-docgen"`, `false` | string or false                                                                                        |
| **reactDocgenTypescriptOptions** | React     | Options to pass to react-docgen-typescript-plugin if react-docgen-typescript is enabled.    | [See docs](https://github.com/hipstersmoothie/react-docgen-typescript-plugin)                          |



### Overriding the configuration to infer additional props

The configuration provided above will remove any props from any third party libraries.

If it's required you can adjust the configuration and include the extra props.

Adjust the configuration as shown below and any third party props will be displayed as soon as you restart your Storybook.

<!-- prettier-ignore-start -->

<CodeSnippets
  paths={[
    'common/storybook-main-extend-ts-config.js.mdx',
  ]}
/>

<!-- prettier-ignore-end -->

Next time you restart your Storybook the extra props will also be in the UI.

<div class="aside">
If you run into an issue where the extra props aren't included, check how your component is being exported. If it's using a default export, change it to a named export and the extra props will be included as well.
</div>

### Troubleshooting

If storybook is not picking up TypeScript errors, ensure:
* you have a `tsconfig.json` ([ref](https://github.com/storybookjs/storybook/issues/14118#issuecomment-794698889))
* `tsconfig.json` is properly including your files, including `*.tsx`. Example: `"include": [ "stories/**/*" ]`
* Eventually, run with additional traces: `DEBUG=docgen:include,docgen:exclude yarn storybook` to check if your files are properly processed

If react docgen is not generating doc based on types, ensure:
* TypeScript is properly configured (see above)
* You don't have TypeScript errors

If using React, if you need help to properly type your components, this site may help: https://react-typescript-cheatsheet.netlify.app/
